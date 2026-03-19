const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ── Resume Analysis ──────────────────────────────────────────────
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
  resumeText: string,
  city: string
): Promise<ResumeAnalysis> {
  const prompt = `You are an expert Indian job market career advisor. Analyze this resume for the ${city} job market.

RESUME:
${resumeText.slice(0, 6000)}

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "suggestedTitle": "most fitting job title",
  "experience": "X years",
  "skills": ["skill1", "skill2", ...up to 12 skills],
  "summary": "2-sentence professional summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "salaryRange": { "min": 8, "max": 15 }
}

The salaryRange should be in LPA (Lakhs Per Annum) appropriate for ${city} market.`;

  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Job Matching ─────────────────────────────────────────────────
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
  resumeText: string,
  city: string,
  userSkills: string[]
): Promise<MatchedJob[]> {
  const prompt = `You are an expert Indian job recruiter. Generate 6 realistic job listings for ${city} that match this candidate.

CANDIDATE SKILLS: ${userSkills.join(", ")}
RESUME EXCERPT: ${resumeText.slice(0, 3000)}

Generate jobs that exist in the ${city} tech ecosystem. Use real company names active in ${city}.

Respond with ONLY valid JSON array (no markdown):
[
  {
    "title": "job title",
    "company": "real company name in ${city}",
    "location": "${city}",
    "type": "Full-time",
    "salaryMin": 12,
    "salaryMax": 18,
    "matchScore": 92,
    "description": "2-sentence job description",
    "skills": ["skill1", "skill2", "skill3"],
    "url": "#",
    "postedDate": "2h ago",
    "whyMatch": "one sentence why this matches the candidate"
  }
]

Salary in LPA. matchScore between 60-98. Mix of company sizes.`;

  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Skill Gap Analysis ───────────────────────────────────────────
export interface SkillGapResult {
  cityDemand: { skill: string; demand: number; youHave: boolean }[];
  missingSkills: { skill: string; priority: "high" | "medium" | "low"; timeToLearn: string; resources: string[] }[];
  marketInsight: string;
  salaryImpact: string;
}

export async function analyzeSkillGap(
  userSkills: string[],
  jobTitle: string,
  city: string
): Promise<SkillGapResult> {
  const prompt = `You are an Indian tech job market expert. Analyze skill gaps for a ${jobTitle} in ${city}.

CANDIDATE SKILLS: ${userSkills.join(", ")}

Respond with ONLY valid JSON (no markdown):
{
  "cityDemand": [
    { "skill": "React", "demand": 92, "youHave": true },
    { "skill": "TypeScript", "demand": 88, "youHave": false }
    ... (10 most relevant skills for ${jobTitle} in ${city})
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "priority": "high",
      "timeToLearn": "2-3 months",
      "resources": ["free resource 1", "free resource 2"]
    }
    ... (top 4 missing skills)
  ],
  "marketInsight": "2-sentence insight about ${jobTitle} demand in ${city}",
  "salaryImpact": "Adding these skills could increase salary by X-Y LPA in ${city}"
}`;

  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
