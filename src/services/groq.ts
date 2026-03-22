// src/services/groq.ts
// All calls go through /api/ai (Vercel serverless) — keys never exposed to browser

const API_PROXY = "/api/ai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = (city: string, skills: string[], jobTitle: string) => `
You are CareerLaunch AI — an expert career advisor specializing in the Indian job market, specifically for ${city}.

CANDIDATE PROFILE:
- Target role: ${jobTitle || "Software Engineer"}
- Skills: ${skills.length > 0 ? skills.join(", ") : "Not analyzed yet"}
- Location: ${city}

You help with:
1. Career guidance specific to Indian tech ecosystem
2. Salary negotiation tips (always in LPA - Lakhs Per Annum)
3. Interview preparation for Indian companies (TCS, Infosys, Flipkart, Swiggy, Razorpay etc.)
4. Skills roadmap for ${city} job market
5. Resume and LinkedIn optimization for Indian recruiters
6. Company culture insights for Indian startups vs MNCs

Be concise, practical, and India-specific. Use LPA for salaries. Reference real Indian platforms (Naukri, LinkedIn, AngelList India, Instahyre). Keep responses under 200 words unless asked for detailed plans. Use plain text only — no markdown bold or asterisks.
`.trim();

// ── Non-streaming ─────────────────────────────────────────────────
export async function chatWithAdvisor(
  messages: ChatMessage[],
  city: string,
  skills: string[],
  jobTitle: string
): Promise<string> {
  const res = await fetch(API_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "groq",
      payload: {
        body: {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT(city, skills, jobTitle) },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 512,
          stream: false,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.error || `Groq proxy error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
}

// ── Streaming ─────────────────────────────────────────────────────
// NOTE: Vercel serverless functions don't support true streaming.
// We use non-streaming and simulate it by calling onChunk once with full response.
// For real streaming, you'd need Vercel Edge Functions (different setup).
export async function streamChatWithAdvisor(
  messages: ChatMessage[],
  city: string,
  skills: string[],
  jobTitle: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const response = await chatWithAdvisor(messages, city, skills, jobTitle);

    // Simulate streaming by sending words progressively
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? "" : " ") + words[i];
      onChunk(chunk);
      // Small delay between words for streaming feel
      await new Promise(r => setTimeout(r, 18));
    }
    onDone();
  } catch (err: any) {
    console.error("Groq proxy error:", err);
    onError(err.message || "Could not connect to AI advisor. Please try again.");
    onDone();
  }
}

// ── Career tips ───────────────────────────────────────────────────
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
      `Network actively on LinkedIn with ${city} recruiters`,
      "Practice DSA on LeetCode for product company interviews",
    ];
  }
}
