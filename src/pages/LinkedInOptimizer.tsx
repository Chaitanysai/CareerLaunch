import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

interface LinkedInResult {
  score: number;
  optimizedHeadline: string;
  optimizedAbout: string;
  engagement: number;
  strength: string;
  topSkills: string[];
  checklist: { item: string; done: boolean }[];
  skillAlignment: { label: string; pct: number }[];
  recommendations: string[];
}

const LinkedInOptimizer = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [copied, setCopied] = useState<"headline" | "about" | null>(null);
  const [form, setForm] = useState({
    currentHeadline: "Software Engineer at TechCorp | Full Stack Developer | Java, Python, React",
    about: "",
    targetRole: "SDE III",
    targetCompany: "Swiggy",
    experience: "3-5",
  });
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const optimize = async () => {
    if (!form.currentHeadline) { toast({ title: "Enter your current headline", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const prompt = `LinkedIn profile optimization expert for Indian tech market.
Optimize for ${city.name}, targeting ${form.targetRole} at ${form.targetCompany}.
Current headline: "${form.currentHeadline}"
About: "${form.about || "not provided"}"
Experience: ${form.experience} years

Respond ONLY with valid JSON (no markdown):
{
  "score": 72,
  "optimizedHeadline": "Senior Full-Stack Architect | Scaling Distributed Systems at TechCorp | React, Go, K8s | Open to High-Impact ${form.targetRole} Roles in ${city.name}",
  "optimizedAbout": "3 paragraphs. Hook sentence. Value proposition with 2-3 achievements with metrics. Closing CTA. 200-250 words. ATS-friendly for Indian recruiters.",
  "engagement": 45,
  "strength": "Elite",
  "topSkills": ["Cloud Architecture","Node.js","System Design","Kafka","Kubernetes"],
  "checklist": [
    {"item":"Profile Picture","done":true},
    {"item":"Professional Banner","done":false},
    {"item":"Rewrite About Section","done":false},
    {"item":"Add Featured Section","done":false},
    {"item":"Get 5 Recommendations","done":false}
  ],
  "skillAlignment": [
    {"label":"Distributed Systems","pct":65},
    {"label":"Java/Microservices","pct":90},
    {"label":"Kubernetes/Docker","pct":40}
  ],
  "recommendations": [
    "Highlight Kafka experience in your Experience bullets",
    "Add System Design to your Top 3 Skills — recruiters at ${form.targetCompany} filter heavily for this",
    "Quantify achievements: change to specific metrics with percentages"
  ]
}
score: 0-100. engagement: predicted % increase. strength: Beginner/Growing/Strong/Elite.`;
      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<LinkedInResult>(raw, null as any);
      setResult(parsed);
    } catch (err: any) {
      toast({ title: "Optimization failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const copy = (text: string, key: "headline" | "about") => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: `${key === "headline" ? "Headline" : "About section"} copied!` });
  };

  const scoreColor = result
    ? result.score >= 80 ? "var(--primary)" : result.score >= 60 ? "#d97706" : "var(--error)"
    : "var(--outline)";

  const circumference = 2 * Math.PI * 56;
  const offset = result ? circumference - (circumference * result.score) / 100 : circumference;

  return (
    <DashboardLayout title="LinkedIn Optimizer">
      <div className="min-h-screen pb-12" style={{ background: "var(--surface-container-low)" }}>
        <div className="max-w-7xl mx-auto px-8 pt-8">

          {/* Hero editorial section — from Stitch */}
          <section className="mb-12 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold leading-tight mb-4"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                LinkedIn Profile{" "}
                <span style={{ color: "var(--primary)" }}>Optimizer</span>
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                AI-driven insights for your digital resume. Turn your profile into a magnet for top recruiters and high-tier engineering roles in {city.name}.
              </p>
            </div>

            {/* Score gauge — from Stitch SVG */}
            <div className="card-stitch p-8 flex flex-col items-center text-center w-64 shrink-0"
              style={{ borderBottom: "4px solid var(--secondary-container)" }}>
              <div className="relative flex items-center justify-center mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="transparent"
                    stroke="var(--surface-container)" strokeWidth="8" />
                  <circle cx="64" cy="64" r="56" fill="transparent"
                    stroke="var(--primary-container)" strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
                    {result ? result.score : "–"}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: "var(--on-surface-variant)" }}>/ 100</span>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase"
                style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                {result ? result.strength : "Not Analyzed"}
              </span>
              <p className="text-[11px] mt-3 font-medium" style={{ color: "var(--on-surface-variant)" }}>
                {result ? `Ranked top 15% in ${city.name}` : "Paste your profile to get score"}
              </p>
            </div>
          </section>

          {/* Input form */}
          <div className="card-stitch p-8 mb-8">
            <h3 className="font-bold text-lg mb-6" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Your Current Profile
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--on-surface-variant)" }}>Current LinkedIn Headline *</label>
                  <input className="input-s" placeholder="Software Engineer at TechCorp | Java, Python, React"
                    value={form.currentHeadline} onChange={e => u("currentHeadline", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--on-surface-variant)" }}>Experience</label>
                  <select className="input-s cursor-pointer" value={form.experience} onChange={e => u("experience", e.target.value)}>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-8">5-8 years</option>
                    <option value="8+">8+ years</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--on-surface-variant)" }}>Target Role</label>
                  <input className="input-s" placeholder="e.g. SDE III, Senior Engineer"
                    value={form.targetRole} onChange={e => u("targetRole", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--on-surface-variant)" }}>Target Company</label>
                  <input className="input-s" placeholder="e.g. Swiggy, Flipkart, Google"
                    value={form.targetCompany} onChange={e => u("targetCompany", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                  style={{ color: "var(--on-surface-variant)" }}>Current About / Summary (paste from LinkedIn)</label>
                <textarea rows={4} className="w-full rounded-xl px-5 py-4 text-sm font-medium border-none outline-none resize-none transition-all"
                  style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}
                  onFocus={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.2)";
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  placeholder="Paste your current LinkedIn About section here..."
                  value={form.about} onChange={e => u("about", e.target.value)} />
              </div>
              <div className="flex justify-end">
                <button className="btn-primary-s px-10 py-4" onClick={optimize} disabled={loading}>
                  {loading
                    ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Optimizing...</>
                    : <><span className="material-symbols-outlined mat-fill" style={{ fontSize: 18 }}>auto_awesome</span>Optimize My Profile</>}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-12 gap-8 items-start">

              {/* Section 1: Headline rewrite — col-span-7 */}
              <div className="col-span-12 lg:col-span-7 card-stitch p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,79,52,0.10)" }}>
                      <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>edit_note</span>
                    </div>
                    <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                      Headline & About Rewrite
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg"
                    style={{ background: "var(--surface-container)", color: "var(--on-surface-variant)" }}>
                    AI SUGGESTION
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Current */}
                  <div className="p-5 rounded-2xl" style={{ background: "var(--surface-container-low)" }}>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: "var(--on-surface-variant)" }}>Current Profile</p>
                    <p style={{ color: "var(--on-surface)" }}>{form.currentHeadline}</p>
                  </div>

                  {/* Optimized headline */}
                  <div className="relative p-6 rounded-2xl border-l-4"
                    style={{ background: "rgba(0,79,52,0.06)", borderColor: "var(--primary)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2"
                          style={{ color: "var(--primary)" }}>Optimized Headline</p>
                        <p className="font-bold text-lg leading-tight"
                          style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
                          {result.optimizedHeadline}
                        </p>
                      </div>
                      <button onClick={() => copy(result.optimizedHeadline, "headline")}
                        className="shrink-0 p-2 rounded-lg transition-colors"
                        style={{ background: "rgba(0,79,52,0.10)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--primary)" }}>
                          {copied === "headline" ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium"
                      style={{ color: "var(--on-primary-fixed-variant, #005236)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                      Predicted {result.engagement}% increase in recruiter engagement
                    </div>
                  </div>

                  {/* Optimized About */}
                  <div className="relative p-6 rounded-2xl border-l-4"
                    style={{ background: "rgba(0,79,52,0.04)", borderColor: "var(--secondary-container)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest"
                        style={{ color: "var(--secondary)" }}>Optimized About Section</p>
                      <button onClick={() => copy(result.optimizedAbout, "about")}
                        className="shrink-0 p-2 rounded-lg transition-colors"
                        style={{ background: "rgba(0,0,0,0.04)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--outline)" }}>
                          {copied === "about" ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--on-surface-variant)" }}>
                      {result.optimizedAbout}
                    </p>
                  </div>

                  <button className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ background: "var(--primary)", color: "var(--on-primary)", boxShadow: "0 8px 24px var(--primary)30" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sync</span>
                    Apply to LinkedIn
                  </button>
                </div>
              </div>

              {/* Right column — col-span-5 */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                {/* Network insights — dark primary card */}
                <div className="rounded-3xl p-8 relative overflow-hidden"
                  style={{ background: "var(--primary)" }}>
                  <div className="relative z-10">
                    <h3 className="font-bold text-xl mb-6 text-white" style={{ fontFamily: "var(--font-headline)" }}>
                      Network Insights
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
                        <p className="text-[10px] font-bold uppercase mb-1"
                          style={{ color: "var(--secondary-fixed)" }}>Recruiter Views</p>
                        <p className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-headline)" }}>124</p>
                        <p className="text-[10px] font-bold mt-1" style={{ color: "var(--secondary-fixed)" }}>+12% this week</p>
                      </div>
                      <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
                        <p className="text-[10px] font-bold uppercase mb-1"
                          style={{ color: "var(--secondary-fixed)" }}>Profile Strength</p>
                        <p className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-headline)" }}>{result.strength}</p>
                        <p className="text-[10px] font-bold mt-1" style={{ color: "var(--secondary-fixed)" }}>Top 15% of SDEs</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase mb-3"
                        style={{ color: "var(--secondary-fixed)" }}>Top Endorsed Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {result.topSkills.map(s => (
                          <span key={s} className="px-3 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: "rgba(255,255,255,0.18)" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-3xl"
                    style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>

                {/* Profile checklist */}
                <div className="card-stitch p-8">
                  <h3 className="font-bold text-xl mb-6" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Profile Checklist
                  </h3>
                  <div className="space-y-3">
                    {result.checklist.map(({ item, done }) => (
                      <div key={item} className="flex items-center justify-between p-4 rounded-2xl"
                        style={{ background: "var(--surface-container-low)" }}>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined"
                            style={{ fontSize: 20, color: done ? "var(--secondary)" : "var(--on-surface-variant)", fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>
                            {done ? "check_circle" : "circle"}
                          </span>
                          <span className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>{item}</span>
                        </div>
                        {done ? (
                          <span className="text-[10px] font-bold" style={{ color: "var(--secondary)" }}>DONE</span>
                        ) : (
                          <button className="text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-colors"
                            style={{ color: "var(--primary)", borderColor: "rgba(0,79,52,0.2)" }}>
                            START NOW
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills alignment — full width */}
              <div className="col-span-12 rounded-[2rem] p-10" style={{ background: "var(--surface-container-low)" }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-extrabold mb-2"
                      style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                      Experience & Skills Alignment
                    </h3>
                    <p style={{ color: "var(--on-surface-variant)", fontWeight: 500 }}>
                      How your profile stacks up against target roles.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-3 p-2 rounded-2xl"
                    style={{ background: "var(--surface-container-lowest)", boxShadow: "0 24px 24px -4px rgba(25,28,30,0.08)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--surface-container-highest)" }}>
                      <span className="font-black text-lg" style={{ color: "var(--primary)", fontFamily: "var(--font-headline)" }}>
                        {form.targetCompany[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase leading-none" style={{ color: "var(--on-surface-variant)" }}>Target Job</p>
                      <p className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>
                        {form.targetRole} @ {form.targetCompany}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest mb-6"
                      style={{ color: "var(--on-surface-variant)" }}>Current Profile Match</p>
                    <div className="space-y-6">
                      {result.skillAlignment.map(({ label, pct }) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>{label}</span>
                            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden"
                            style={{ background: "var(--surface-container-highest)" }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: "var(--primary)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card-stitch p-8">
                    <p className="text-xs font-extrabold uppercase tracking-widest mb-6"
                      style={{ color: "var(--primary)" }}>AI Recommendations</p>
                    <ul className="space-y-4">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="material-symbols-outlined font-bold mt-0.5"
                            style={{ color: "var(--secondary)", fontSize: 20 }}>add_circle</span>
                          <p className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>{r}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LinkedInOptimizer;
