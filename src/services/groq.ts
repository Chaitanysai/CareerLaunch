const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = (city: string, skills: string[], jobTitle: string) => `
You are RoleMatch AI — an expert career advisor specializing in the Indian job market, specifically for ${city}.

CANDIDATE PROFILE:
- Target role: ${jobTitle || "Software Engineer"}
- Skills: ${skills.length > 0 ? skills.join(", ") : "Not analyzed yet"}
- Location: ${city}

You help with:
1. Career guidance specific to Indian tech ecosystem
2. Salary negotiation tips (in LPA - Lakhs Per Annum)
3. Interview preparation for Indian companies
4. Skills roadmap for ${city} job market
5. Resume and LinkedIn optimization
6. Company culture insights (TCS, Infosys, Wipro, startups, MNCs in India)

Be concise, practical, and India-specific. Use LPA for salaries. Reference real Indian companies and platforms (Naukri, LinkedIn, AngelList India, Instahyre). Keep responses under 200 words unless asked for detailed plans.
`.trim();

// ── Non-streaming (simple) ───────────────────────────────────────
export async function chatWithAdvisor(
  messages: ChatMessage[],
  city: string,
  skills: string[],
  jobTitle: string
): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT(city, skills, jobTitle) },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Streaming ────────────────────────────────────────────────────
export async function streamChatWithAdvisor(
  messages: ChatMessage[],
  city: string,
  skills: string[],
  jobTitle: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT(city, skills, jobTitle) },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 512,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Groq error: ${res.status}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const json = line.replace("data: ", "").trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) onChunk(text);
      } catch {}
    }
  }
  onDone();
}

// ── Quick career tips ────────────────────────────────────────────
export async function getCareerTips(
  city: string,
  jobTitle: string
): Promise<string[]> {
  const msgs: ChatMessage[] = [{
    role: "user",
    content: `Give me 4 quick career tips for a ${jobTitle} in ${city} job market. Be specific to India. Return as JSON array of strings only.`,
  }];
  const raw = await chatWithAdvisor(msgs, city, [], jobTitle);
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]") + 1;
    return JSON.parse(clean.slice(start, end));
  } catch {
    return ["Keep your Naukri profile updated", "Prepare for system design rounds", "Network on LinkedIn actively", "Practice DSA on LeetCode"];
  }
}
