// api/ai.ts  — Vercel Edge Function
// Place this file at: api/ai.ts (project root level, not inside src/)
//
// This moves ALL AI API keys server-side so they are NEVER
// visible in the browser bundle. The frontend calls /api/ai instead
// of calling Gemini/Groq directly.
//
// In Vercel Dashboard → Settings → Environment Variables, add:
//   GEMINI_API_KEY   (no VITE_ prefix — server only)
//   GROQ_API_KEY     (no VITE_ prefix — server only)
//   RAPIDAPI_KEY     (no VITE_ prefix — server only)

import type { VercelRequest, VercelResponse } from "@vercel/node";

// ── Simple in-memory rate limiter (per IP, resets on cold start) ──
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 30;      // max requests
const RATE_WINDOW = 60_000; // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true; // allowed
  }
  if (entry.count >= RATE_LIMIT) return false; // blocked
  entry.count++;
  return true;
}

// ── Allowed origins ───────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://careerlaunch.vercel.app",
  "https://role-match-eta.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit by IP
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket.remoteAddress
    || "unknown";

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait 60 seconds." });
  }

  const { provider, payload } = req.body as {
    provider: "gemini" | "groq" | "rapidapi";
    payload: Record<string, unknown>;
  };

  if (!provider || !payload) {
    return res.status(400).json({ error: "Missing provider or payload" });
  }

  try {
    // ── Route to correct provider ──────────────────────────────
    if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(500).json({ error: "Gemini not configured" });

      const model = (payload.model as string) || "gemini-2.0-flash";
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload.body),
        }
      );
      const data = await geminiRes.json();
      return res.status(geminiRes.status).json(data);
    }

    if (provider === "groq") {
      const key = process.env.GROQ_API_KEY;
      if (!key) return res.status(500).json({ error: "Groq not configured" });

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify(payload.body),
      });
      const data = await groqRes.json();
      return res.status(groqRes.status).json(data);
    }

    if (provider === "rapidapi") {
      const key = process.env.RAPIDAPI_KEY;
      if (!key) return res.status(500).json({ error: "RapidAPI not configured" });

      const { host, path } = payload as { host: string; path: string };
      const rapidRes = await fetch(`https://${host}${path}`, {
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": host,
        },
      });
      const data = await rapidRes.json();
      return res.status(rapidRes.status).json(data);
    }

    return res.status(400).json({ error: "Unknown provider" });

  } catch (err: any) {
    console.error("API proxy error:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
