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
2. Salary negotiation tips (always in LPA - Lakhs Per Annum)
3. Interview preparation for Indian companies (TCS, Infosys, Wipro, Flipkart, Swiggy, Razorpay etc.)
4. Skills roadmap for ${city} job market
5. Resume and LinkedIn optimization for Indian recruiters
6. Company culture insights for Indian startups vs MNCs

Be concise, practical, and India-specific. Use LPA for salaries. Reference real Indian platforms (Naukri, LinkedIn, AngelList India, Instahyre). Keep responses under 200 words unless asked for detailed plans. Use plain text only — no markdown bold or asterisks.
`.trim();

// ── Non-streaming (used as fallback) ────────────────────────────
export async function chatWithAdvisor(
  messages: ChatMessage[],
  city: string,
  skills: string[],
  jobTitle: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT(city, skills, jobTitle) },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 512,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message || `Groq error: ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
}

// ── Streaming ────────────────────────────────────────────────────
export async function streamChatWithAdvisor(
  messages: ChatMessage[],
  city: string,
  skills: string[],
  jobTitle: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  if (!GROQ_API_KEY) {
    onError("Groq API key not configured. Add VITE_GROQ_API_KEY to your .env and Vercel env vars.");
    onDone();
    return;
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `Groq API error ${res.status}`;
      // If streaming fails, try non-streaming fallback
      if (res.status === 400 || res.status === 422) {
        const fallback = await chatWithAdvisor(messages, city, skills, jobTitle);
        onChunk(fallback);
        onDone();
        return;
      }
      throw new Error(msg);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) { onDone(); return; }

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
        } catch {
          // skip malformed chunks
        }
      }
    }
    onDone();
  } catch (err: any) {
    console.error("Groq streaming error:", err);
    // Try non-streaming fallback
    try {
      const fallback = await chatWithAdvisor(messages, city, skills, jobTitle);
      onChunk(fallback);
      onDone();
    } catch (fallbackErr: any) {
      onError(fallbackErr.message || "Could not connect to AI advisor. Please try again.");
      onDone();
    }
  }
}

// ── Career tips ──────────────────────────────────────────────────
export async function getCareerTips(city: string, jobTitle: string): Promise<string[]> {
  try {
    const result = await chatWithAdvisor(
      [{
        role: "user",
        content: `Give me 4 quick career tips for a ${jobTitle} in ${city} job market. Be specific to India. Return ONLY a JSON array of 4 strings, no other text.`,
      }],
      city, [], jobTitle
    );
    const clean = result.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]") + 1;
    if (start === -1) throw new Error("No JSON array found");
    return JSON.parse(clean.slice(start, end));
  } catch {
    return [
      `Keep your Naukri profile updated for ${city} jobs`,
      "Prepare for system design rounds for senior roles",
      "Network actively on LinkedIn with ${city} recruiters",
      "Practice DSA on LeetCode for product company interviews",
    ];
  }
}