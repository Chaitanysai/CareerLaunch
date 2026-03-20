import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  type: "current" | "skill-up" | "goal";
  title: string; subtitle: string;
  skills?: string[]; salaryRange?: string;
  progress?: { label: string; pct: number }[];
  locked?: boolean;
}

interface Roadmap {
  currentRole: string; targetRole: string; totalTime: string;
  milestones: Milestone[];
  salaryGrowth: { label: string; value: string; pct: number }[];
  courses: { icon: string; title: string; source: string }[];
  tip: string;
}

const CareerRoadmap = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [form, setForm] = useState({ currentRole: "Senior Frontend Engineer", targetRole: "Principal Architect", experience: "3-5", skills: "" });
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.currentRole || !form.targetRole) { toast({ title: "Enter both roles", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const prompt = `Career coach for Indian tech market. Build a career roadmap.
From: ${form.currentRole} (${form.experience} yrs) → To: ${form.targetRole} in ${city.name}
Current skills: ${form.skills || "React, TypeScript, Node.js"}

Respond ONLY with valid JSON (no markdown):
{
  "currentRole": "${form.currentRole}",
  "targetRole": "${form.targetRole}",
  "totalTime": "18-24 months",
  "milestones": [
    {"type":"current","title":"${form.currentRole}","subtitle":"At current company • Since 2022","skills":["React","TypeScript","Next.js"]},
    {"type":"skill-up","title":"Mastering System Design","subtitle":"Focus: Scalability, Microservices, Distributed Systems","progress":[{"label":"HLD Fundamentals","pct":65},{"label":"Database Sharding","pct":0}]},
    {"type":"goal","title":"${form.targetRole}","subtitle":"Projected: Q3 2026","salaryRange":"₹75 — 95 LPA","locked":true}
  ],
  "salaryGrowth": [
    {"label":"Y1 (32L)","value":"32","pct":35},
    {"label":"Y2 (38L)","value":"38","pct":42},
    {"label":"Y3 (52L)","value":"52","pct":58},
    {"label":"Y4 (68L)","value":"68","pct":75},
    {"label":"Y5 (88L)","value":"88","pct":95}
  ],
  "courses": [
    {"icon":"database","title":"Advanced System Design","source":"Educative • 12 Modules"},
    {"icon":"cloud_done","title":"Kubernetes Mastery","source":"Udemy • 8.5 Hours"},
    {"icon":"groups","title":"Engineering Leadership","source":"Pluralsight • 4 Modules"}
  ],
  "tip": "Growth insight for ${city.name} tech market"
}`;
      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<Roadmap>(raw, null as any);
      setRoadmap(parsed);
    } catch (err: any) {
      toast({ title: "Failed to generate roadmap", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Career Roadmap">
      <div className="min-h-screen" style={{ background: "var(--surface-container-low)" }}>
        <div className="max-w-7xl mx-auto px-10 py-12 space-y-12">

          {/* Hero section — from Stitch: primary-container bg */}
          <section className="relative rounded-3xl overflow-hidden p-12"
            style={{ background: "var(--primary-container)", boxShadow: "0 20px 40px var(--primary)18" }}>
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                AI-POWERED PATHWAY
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-primary-container)" }}>
                Your Career Path to <span style={{ color: "var(--secondary-fixed)" }}>
                  {roadmap?.targetRole || form.targetRole || "Your Goal"}
                </span>
              </h2>
              <p className="text-lg opacity-90 mb-8" style={{ color: "var(--on-primary-container)", fontFamily: "var(--font-body)" }}>
                We've analyzed 4,500+ successful career transitions in {city.name}'s tech hub to build this personalized roadmap.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button className="px-6 py-3 rounded-xl font-bold transition-all"
                  style={{ background: "white", color: "var(--primary)", fontFamily: "var(--font-headline)" }}>
                  Download PDF
                </button>
                <button className="px-6 py-3 rounded-xl font-bold transition-all"
                  style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", fontFamily: "var(--font-headline)" }}>
                  Edit Goal
                </button>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
              <div className="w-full h-full rotate-12 translate-x-1/4"
                style={{ background: "linear-gradient(to bottom right, var(--secondary-fixed), transparent)" }} />
            </div>
          </section>

          {/* Config form */}
          <div className="card-stitch p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {[
                { label: "Current Role", key: "currentRole", ph: "Senior Frontend Engineer" },
                { label: "Target Role",  key: "targetRole",  ph: "Principal Architect" },
                { label: "Current Skills", key: "skills",    ph: "React, TypeScript, Node.js" },
              ].map(({ label, key, ph }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--on-surface-variant)" }}>{label}</label>
                  <input className="input-s" placeholder={ph} value={(form as any)[key]} onChange={e => u(key, e.target.value)} />
                </div>
              ))}
              <button className="btn-primary-s justify-center py-4" onClick={generate} disabled={loading}>
                {loading
                  ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Building...</>
                  : <><span className="material-symbols-outlined mat-fill" style={{ fontSize: 18 }}>map</span>Generate Roadmap</>}
              </button>
            </div>
          </div>

          {roadmap && (
            <>
              {/* Timeline */}
              <section className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>Milestones</h3>
                    <p style={{ color: "var(--on-surface-variant)" }}>Your evolutionary steps toward {roadmap.targetRole}.</p>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--primary)" }}>
                    <span>Total time: {roadmap.totalTime}</span>
                    <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-container-high)" }}>
                      <div className="w-1/3 h-full rounded-full" style={{ background: "var(--primary)" }} />
                    </div>
                  </div>
                </div>

                <div className="relative pl-8 space-y-12">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5"
                    style={{ background: `linear-gradient(to bottom, var(--primary), var(--outline-variant), rgba(0,0,0,0.1))` }} />

                  {roadmap.milestones.map((m, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full ring-4"
                        style={{
                          background: m.type === "current" ? "var(--primary)" : m.locked ? "var(--surface-container-highest)" : "white",
                          ringColor: m.type === "current" ? "var(--primary)" : m.type === "goal" ? "var(--outline-variant)" : "var(--primary)",
                          border: m.type === "skill-up" ? "4px solid var(--primary)" : "4px solid transparent",
                          outline: m.type === "current" ? `4px solid ${`rgba(0,79,52,0.2)`}` : m.type === "goal" ? "4px solid var(--outline-variant)" : "none",
                        }} />

                      <div className={`card-stitch p-6 transition-all ${m.locked ? "opacity-80 grayscale" : ""}`}
                        style={{ ring: m.type === "skill-up" ? "2px solid var(--primary)" : "none" }}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest mb-1 block"
                              style={{ color: m.type === "current" ? "var(--primary)" : m.type === "skill-up" ? "var(--on-tertiary-fixed-variant, #075138)" : "var(--on-surface-variant)" }}>
                              {m.type === "current" ? "Current Role" : m.type === "skill-up" ? "Skill Up Phase" : "North Star Goal"}
                            </span>
                            <h4 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>{m.title}</h4>
                            <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>{m.subtitle}</p>
                          </div>
                          {m.type === "current" && (
                            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 32, color: "var(--primary)" }}>check_circle</span>
                          )}
                          {m.type === "goal" && (
                            <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--outline-variant)" }}>stars</span>
                          )}
                        </div>

                        {m.skills && (
                          <div className="flex flex-wrap gap-2">
                            {m.skills.map(s => (
                              <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: "var(--surface-container)" }}>{s}</span>
                            ))}
                          </div>
                        )}

                        {m.progress && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {m.progress.map(({ label, pct }) => (
                              <div key={label} className="p-4 rounded-2xl border-l-4"
                                style={{ background: "var(--surface-container-low)", borderColor: pct > 0 ? "var(--primary)" : "var(--outline-variant)" }}>
                                <p className="text-xs font-bold mb-1" style={{ color: "var(--on-surface-variant)" }}>
                                  {pct > 0 ? "LEARNING PROGRESS" : "UPCOMING"}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-sm" style={{ color: "var(--on-surface)", opacity: pct === 0 ? 0.5 : 1 }}>{label}</span>
                                  <span className="font-bold text-sm" style={{ color: pct > 0 ? "var(--primary)" : "var(--outline)", opacity: pct === 0 ? 0.5 : 1 }}>
                                    {pct > 0 ? `${pct}%` : "Locked"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {m.salaryRange && (
                          <div className="p-4 rounded-2xl flex items-center gap-4 mt-4"
                            style={{ background: "var(--surface-container)" }}>
                            <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>payments</span>
                            <div>
                              <p className="text-xs font-bold opacity-60">ESTIMATED COMPENSATION</p>
                              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-headline)" }}>{m.salaryRange}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Salary chart + courses */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-stitch p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                        Projected Timeline
                      </h3>
                      <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
                        Estimated salary growth based on {city.name} market data
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                      +140% Growth
                    </span>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4 pt-4">
                    {roadmap.salaryGrowth.map(({ label, pct }, i) => {
                      const isCurrent = i === 2;
                      return (
                        <div key={label} className="flex-1 flex flex-col items-center gap-3">
                          <div className="w-full rounded-t-xl transition-all hover:opacity-80"
                            style={{
                              height: `${pct}%`,
                              background: isCurrent ? "var(--primary-container)" : "var(--surface-container-high)",
                              boxShadow: isCurrent ? "0 8px 24px var(--primary)30" : "none",
                            }} />
                          <span className="text-[10px] font-bold"
                            style={{ color: isCurrent ? "var(--primary)" : "var(--on-surface-variant)", fontWeight: isCurrent ? 800 : 700 }}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-4 text-sm border-t"
                    style={{ color: "var(--on-surface-variant)", borderColor: "var(--outline-variant)" }}>
                    <span className="material-symbols-outlined text-xs">info</span>
                    <span>Values represent median ₹LPA in top-tier product firms in {city.name}.</span>
                  </div>
                </div>

                {/* Courses */}
                <div className="p-8 rounded-3xl space-y-6" style={{ background: "var(--surface-container)" }}>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>Recommended</h3>
                  <div className="space-y-4">
                    {roadmap.courses.map(({ icon, title, source }) => (
                      <div key={title} className="card-stitch p-4 group cursor-pointer hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors"
                            style={{ background: "var(--surface-container-highest)" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,79,52,0.10)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container-highest)"}>
                            <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>{icon}</span>
                          </div>
                          <div>
                            <h5 className="text-sm font-bold leading-tight transition-colors"
                              style={{ color: "var(--on-surface)", fontFamily: "var(--font-headline)" }}>
                              {title}
                            </h5>
                            <p className="text-xs mt-1" style={{ color: "var(--on-surface-variant)" }}>{source}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 text-sm font-bold rounded-xl transition-all border"
                    style={{ color: "var(--primary)", borderColor: "rgba(0,79,52,0.2)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,79,52,0.05)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    View All Learning Paths
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <button onClick={() => window.location.href = "/advisor"} className="fab-s fixed bottom-10 right-10 z-50">
        <span className="material-symbols-outlined mat-fill" style={{ fontSize: 28 }}>chat_bubble</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          style={{ background: "var(--secondary)" }} />
      </button>
    </DashboardLayout>
  );
};

export default CareerRoadmap;
