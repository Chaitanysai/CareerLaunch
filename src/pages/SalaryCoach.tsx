import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

interface Result {
  marketMin: number; marketMedian: number; marketMax: number;
  verdict: "underpaid" | "fair" | "above-market";
  verdictText: string;
  counterMin: number; counterMax: number;
  script: string;
  tips: { icon: string; title: string; body: string }[];
}

const SalaryCoach = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    jobTitle: "Senior Product Designer", company: "InnovateTech Solutions",
    experience: "6.5", location: city.name, currentCTC: "28",
    companySize: "mid",
  });
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const analyze = async () => {
    if (!form.jobTitle) { toast({ title: "Enter a job title", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const prompt = `Salary negotiation expert for Indian tech market. Analyze this offer:
Role: ${form.jobTitle} at ${form.company || "unspecified"} in ${form.location}, India
Experience: ${form.experience} years | Current CTC: ₹${form.currentCTC}L | Company size: ${form.companySize}

Respond ONLY with valid JSON (no markdown):
{
  "marketMin": 24, "marketMedian": 32.5, "marketMax": 48,
  "verdict": "underpaid",
  "verdictText": "2-sentence assessment based on 400+ data points in ${form.location}",
  "counterMin": 34, "counterMax": 38,
  "script": "Word-for-word 3-sentence negotiation script mentioning specific LPA numbers and contributions",
  "tips": [
    {"icon": "location_on", "title": "Geo-Premium", "body": "City-specific salary insight"},
    {"icon": "bolt", "title": "Hot Skill Bonus", "body": "Skill-specific leverage tip"}
  ]
}
All salary in LPA. verdict: "underpaid" | "fair" | "above-market".`;
      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<Result>(raw, null as any);
      setResult(parsed);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const copyScript = () => {
    if (result?.script) {
      navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const verdictConfig = {
    underpaid: { bg: "#fffbeb", iconBg: "#fde68a", icon: "trending_down", iconColor: "#92400e", labelColor: "#92400e", label: "Slightly Underpaid" },
    fair: { bg: "#f0fdf4", iconBg: "#dcfce7", icon: "trending_flat", iconColor: "var(--primary)", labelColor: "var(--primary)", label: "Fair Market Rate" },
    "above-market": { bg: "#eff6ff", iconBg: "#dbeafe", icon: "trending_up", iconColor: "#1d4ed8", labelColor: "#1d4ed8", label: "Above Market!" },
  };

  return (
    <DashboardLayout title="Salary Coach">
      <div className="max-w-6xl mx-auto p-8 lg:p-12">
        {/* Header — from Stitch HTML */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
            Salary Coach
          </h1>
          <p className="text-lg" style={{ color: "var(--on-surface-variant)" }}>
            AI-powered market calibration for high-growth tech roles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input form — surface-container-lowest card */}
          <div className="lg:col-span-5">
            <div className="card-stitch p-8" style={{ boxShadow: "0 24px 24px -4px rgba(25,28,30,0.06)" }}>
              <h2 className="font-bold text-xl mb-8" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                Your Current Benchmarks
              </h2>
              <div className="space-y-6">
                {[
                  { label: "Job Title", key: "jobTitle", placeholder: "Senior Product Designer" },
                  { label: "Company", key: "company", placeholder: "InnovateTech Solutions" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: "var(--on-surface-variant)" }}>{label}</label>
                    <input className="input-s" placeholder={placeholder}
                      value={(form as any)[key]} onChange={e => u(key, e.target.value)} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: "var(--on-surface-variant)" }}>Experience</label>
                    <div className="relative">
                      <input className="input-s pr-16" type="number" placeholder="6.5"
                        value={form.experience} onChange={e => u("experience", e.target.value)} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold"
                        style={{ color: "var(--on-surface-variant)" }}>Years</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: "var(--on-surface-variant)" }}>Location</label>
                    <input className="input-s" placeholder={city.name}
                      value={form.location} onChange={e => u("location", e.target.value)} />
                  </div>
                </div>
                {/* Slider for CTC */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--on-surface-variant)" }}>Current CTC (LPA)</label>
                    <span className="font-extrabold text-xl" style={{ color: "var(--primary)", fontFamily: "var(--font-headline)" }}>
                      ₹ {form.currentCTC}
                    </span>
                  </div>
                  <input type="range" min={5} max={100} className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--primary)", background: "var(--surface-container-high)" }}
                    value={Number(form.currentCTC)}
                    onChange={e => u("currentCTC", e.target.value)} />
                </div>

                <button className="btn-primary-s w-full justify-center py-4 mt-2"
                  onClick={analyze} disabled={loading}>
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Recalibrating...</>
                  ) : "Recalibrate Analysis"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7 space-y-6">
            {!result ? (
              <div className="card-stitch p-12 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(0,0,0,0.04)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--outline)" }}>payments</span>
                </div>
                <p className="font-bold text-lg" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Enter your details and click Recalibrate
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>
                  We'll tell you your exact market position in {city.name}
                </p>
              </div>
            ) : (
              <>
                {/* Verdict card — amber bg from Stitch */}
                {(() => {
                  const vc = verdictConfig[result.verdict];
                  return (
                    <div className="rounded-3xl p-8 flex items-center gap-6 relative overflow-hidden"
                      style={{ background: vc.bg }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: vc.iconBg }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, color: vc.iconColor }}>
                          {vc.icon}
                        </span>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                          style={{ color: vc.labelColor, opacity: 0.7 }}>Coach Verdict</p>
                        <h3 className="text-3xl font-extrabold leading-tight"
                          style={{ fontFamily: "var(--font-headline)", color: vc.labelColor }}>
                          {vc.label}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: vc.labelColor, opacity: 0.8 }}>{result.verdictText}</p>
                      </div>
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[120px] font-black select-none"
                        style={{ color: `${vc.iconColor}08`, fontFamily: "var(--font-headline)" }}>!</div>
                    </div>
                  );
                })()}

                {/* Market range — 3 cards, median in primary */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Minimum", value: result.marketMin, sub: "10th Percentile", primary: false },
                    { label: "Median Market", value: result.marketMedian, sub: "RoleMatch Standard", primary: true },
                    { label: "Top Talent", value: result.marketMax, sub: "90th Percentile", primary: false },
                  ].map(({ label, value, sub, primary }) => (
                    <div key={label} className={`p-6 rounded-3xl text-center ${primary ? "scale-105" : ""}`}
                      style={{
                        background: primary ? "var(--primary)" : "var(--surface-container-low)",
                        boxShadow: primary ? "0 16px 32px var(--primary)30" : "none",
                      }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4"
                        style={{ color: primary ? "rgba(255,255,255,0.6)" : "var(--on-surface-variant)" }}>
                        {label}
                      </p>
                      <p className={`font-extrabold tracking-tight mb-1 ${primary ? "text-4xl" : "text-3xl"}`}
                        style={{ fontFamily: "var(--font-headline)", color: primary ? "white" : "var(--on-surface)" }}>
                        ₹ {value}
                      </p>
                      <p className="text-[10px] font-bold"
                        style={{ color: primary ? "rgba(255,255,255,0.6)" : "var(--on-surface-variant)" }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Negotiation script */}
                <div className="card-stitch p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-lg" style={{ background: "var(--secondary-container)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--on-secondary-container)" }}>forum</span>
                    </div>
                    <h4 className="font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                      Your Negotiation Script
                    </h4>
                  </div>
                  <div className="relative pl-6 border-l-2 py-2"
                    style={{ borderColor: "rgba(0,0,0,0.10)" }}>
                    <span className="material-symbols-outlined absolute -left-4 top-0 text-3xl"
                      style={{ color: "var(--primary)", opacity: 0.15 }}>format_quote</span>
                    <p className="text-base italic leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                      "{result.script}"
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={copyScript}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all"
                      style={{ background: "var(--surface-container)", color: "var(--on-surface)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container)"}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {copied ? "check" : "content_copy"}
                      </span>
                      {copied ? "Copied!" : "Copy Script"}
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all"
                      style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                      Refine with AI
                    </button>
                  </div>
                </div>

                {/* Tips grid */}
                <div className="grid grid-cols-2 gap-4">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="p-6 rounded-2xl" style={{ background: "var(--surface-container)" }}>
                      <span className="material-symbols-outlined mb-3" style={{ color: "var(--primary)" }}>{tip.icon}</span>
                      <h5 className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                        {tip.title}
                      </h5>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>{tip.body}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalaryCoach;
