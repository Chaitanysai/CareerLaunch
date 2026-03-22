// src/services/gemini.ts
// All calls go through /api/ai (Vercel serverless) — keys never exposed to browser

const API_PROXY = "/api/ai";

// ── Helper: call our proxy ────────────────────────────────────────
async function callProxy(model: string, body: object): Promise<string> {
  const res = await fetch(API_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "gemini",
      payload: { model, body },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.error || `Gemini proxy error: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ── Build parts array (text or PDF) ──────────────────────────────
export interface ResumeContent {
  text?: string;
  base64?: string;
  mimeType?: string;
}

function buildParts(content: ResumeContent, prompt: string) {
  if (content.base64 && content.mimeType) {
    return [
      { inline_data: { mime_type: content.mimeType, data: content.base64 } },
      { text: prompt },
    ];
  }
  return [{ text: `${prompt}\n\nRESUME CONTENT:\n${(content.text || "").slice(0, 6000)}` }];
}

// ── Fallback chain ────────────────────────────────────────────────
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
];

async function callWithFallback(parts: object[]): Promise<string> {
  let lastErr: Error | null = null;
  for (const model of MODELS) {
    try {
      return await callProxy(model, {
        contents: [{ parts }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      });
    } catch (e: any) {
      lastErr = e;
      if (e.message?.includes("429") || e.message?.includes("quota")) continue;
      throw e; // non-quota error — don't retry
    }
  }
  throw lastErr ?? new Error("All Gemini models failed");
}

// ── Parse JSON safely ─────────────────────────────────────────────
export function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{") !== -1 ? clean.indexOf("{") : clean.indexOf("[");
    const isArr = clean.indexOf("[") !== -1 && (clean.indexOf("[") < clean.indexOf("{") || clean.indexOf("{") === -1);
    const s = isArr ? clean.indexOf("[") : clean.indexOf("{");
    const e = isArr ? clean.lastIndexOf("]") + 1 : clean.lastIndexOf("}") + 1;
    if (s === -1 || e === 0) return fallback;
    return JSON.parse(clean.slice(s, e));
  } catch {
    return fallback;
  }
}

// ── Resume Analysis ───────────────────────────────────────────────
export interface ResumeAnalysis {
  suggestedTitle: string;
  experience: string;
  skills: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  salaryRange: { min: number; max: number };
}

export async function analyzeResume(
  content: ResumeContent,
  city: string
): Promise<ResumeAnalysis> {
  const prompt = `You are an expert Indian job market career advisor. Analyze this resume for the ${city} job market.

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "suggestedTitle": "most fitting job title",
  "experience": "X years",
  "skills": ["skill1","skill2","skill3","skill4","skill5"],
  "summary": "2-sentence professional summary",
  "strengths": ["strength1","strength2","strength3"],
  "improvements": ["improvement1","improvement2"],
  "salaryRange": { "min": 8, "max": 15 }
}
salaryRange in LPA appropriate for ${city} market.`;

  const raw = await callWithFallback(buildParts(content, prompt));
  return safeParseJSON<ResumeAnalysis>(raw, {
    suggestedTitle: "Software Engineer",
    experience: "3+ years",
    skills: [],
    summary: "",
    strengths: [],
    improvements: [],
    salaryRange: { min: 8, max: 20 },
  });
}

// ── Job Matching ──────────────────────────────────────────────────
export interface MatchedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  matchScore: number;
  description: string;
  skills: string[];
  url: string;
  postedDate: string;
  whyMatch: string;
}

export async function matchJobs(
  content: ResumeContent,
  city: string,
  userSkills: string[]
): Promise<MatchedJob[]> {
  const skillsHint = userSkills.length > 0 ? `Candidate skills: ${userSkills.join(", ")}` : "";

  const prompt = `You are an expert Indian job recruiter. Generate 6 realistic job listings for ${city} matching this resume.

${skillsHint}

Use real Indian company names active in ${city} (Flipkart, Swiggy, Razorpay, Zepto, CRED, PhonePe, Amazon India, etc.)

Respond with ONLY a valid JSON array (no markdown):
[
  {
    "title": "job title",
    "company": "real company name",
    "location": "${city}",
    "type": "Full-time",
    "salaryMin": 12,
    "salaryMax": 18,
    "matchScore": 92,
    "description": "2-sentence job description",
    "skills": ["skill1","skill2","skill3"],
    "url": "#",
    "postedDate": "2h ago",
    "whyMatch": "one sentence why this matches"
  }
]
Salary in LPA. matchScore 65-96. Mix startup + MNC.`;

  const raw = await callWithFallback(buildParts(content, prompt));
  return safeParseJSON<MatchedJob[]>(raw, []);
}

// ── Skill Gap Analysis ────────────────────────────────────────────
export interface SkillGapResult {
  cityDemand: { skill: string; demand: number; youHave: boolean }[];
  missingSkills: {
    skill: string;
    priority: "high" | "medium" | "low";
    timeToLearn: string;
    resources: string[];
  }[];
  marketInsight: string;
  salaryImpact: string;
}

export async function analyzeSkillGap(
  userSkills: string[],
  jobTitle: string,
  city: string
): Promise<SkillGapResult> {
  const prompt = `You are an Indian tech job market expert. Analyze skill gaps for a ${jobTitle} in ${city}.

Candidate's current skills: ${userSkills.join(", ")}

Respond with ONLY valid JSON (no markdown):
{
  "cityDemand": [
    { "skill": "React", "demand": 92, "youHave": true },
    { "skill": "TypeScript", "demand": 88, "youHave": false }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "priority": "high",
      "timeToLearn": "2-3 months",
      "resources": ["free resource 1", "free resource 2"]
    }
  ],
  "marketInsight": "2-sentence insight about ${jobTitle} demand in ${city}",
  "salaryImpact": "Adding these skills could increase salary by X-Y LPA in ${city}"
}
Include 10 skills in cityDemand and top 4 missing skills.`;

  const res = await fetch(API_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "gemini",
      payload: {
        model: "gemini-2.0-flash",
        body: {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`Skill gap analysis failed: ${res.status}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return safeParseJSON<SkillGapResult>(raw, {
    cityDemand: [],
    missingSkills: [],
    marketInsight: "",
    salaryImpact: "",
  });
}

// ── Generic AI call (used by other pages) ────────────────────────
export async function callAI(
  _content: ResumeContent | null,
  prompt: string
): Promise<string> {
  return callWithFallback([{ text: prompt }]);
}
