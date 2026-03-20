import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

interface CompanyData {
  name: string; industry: string; size: string;
  hiring: "actively-hiring" | "selective" | "freeze";
  rating: number; reviewCount: number;
  description: string;
  techStack: string[];
  ratings: { label: string; value: number }[];
  salaryRanges: { role: string; min: number; max: number }[];
  pros: string[]; cons: string[];
  interviewProcess: { step: string; desc: string }[];
  verdict: string;
}

const POPULAR = ["Flipkart", "Razorpay", "Swiggy", "PhonePe", "CRED", "Zepto", "Zomato", "Amazon India", "Google India", "Microsoft India"];

const CompanyResearch = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompanyData | null>(null);

  const research = async (co: string = query) => {
    if (!co.trim()) { toast({ title: "Enter a company name", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const prompt = `Expert on Indian tech companies. Research "${co}" for a job seeker in ${city.name}.

Respond ONLY with valid JSON (no markdown):
{
  "name": "${co}",
  "industry": "E-commerce",
  "size": "15,000+ employees",
  "hiring": "actively-hiring",
  "rating": 4.2,
  "reviewCount": 12400,
  "description": "3-sentence company overview",
  "techStack": ["React.js","Java/Spring","Cassandra","GCP","Kafka"],
  "ratings": [
    {"label":"Work-Life Balance","value":3.8},
    {"label":"Culture & Values","value":4.5},
    {"label":"Career Growth","value":4.8},
    {"label":"Job Security","value":4.1}
  ],
  "salaryRanges": [
    {"role":"Software Engineer I","min":24,"max":32},
    {"role":"Senior Engineer (SDE II)","min":38,"max":55},
    {"role":"SDE III / Tech Lead","min":65,"max":90}
  ],
  "pros": ["pro1","pro2","pro3"],
  "cons": ["con1","con2"],
  "interviewProcess": [
    {"step":"Online Assessment","desc":"2 DS/Algo questions (90 mins)"},
    {"step":"Machine Coding","desc":"Design and implement a system module in 2 hours"},
    {"step":"Technical Interviews","desc":"System Design (LLD/HLD) deep-dives"},
    {"step":"Hiring Manager","desc":"Culture fit and leadership evaluation"}
  ],
  "verdict": "2-sentence honest assessment"
}
hiring: "actively-hiring" | "selective" | "freeze". Salary in LPA. Be accurate.`;
      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<CompanyData>(raw, null as any);
      setData(parsed);
    } catch (err: any) {
      toast({ title: "Research failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const hiringBadge = {
    "actively-hiring": { bg: "var(--secondary-container)", color: "var(--on-secondary-container)", label: "HIRING NOW" },
    selective: { bg: "#fef3c7", color: "#92400e", label: "SELECTIVE" },
    freeze: { bg: "#fee2e2", color: "#991b1b", label: "FREEZE" },
  };

  return (
    <DashboardLayout title="Company Research">
      <div className="p-8 min-h-screen" style={{ background: "var(--surface-container-low)" }}>
        <div className="max-w-6xl mx-auto">

          {/* Search — from Stitch header style */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Company Research
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--on-surface-variant)" }}>
              AI-powered insights on culture, salary, interview process & hiring status.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-2xl">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--outline)", fontSize: 20 }}>search</span>
                <input className="w-full pl-12 pr-6 py-4 rounded-2xl text-sm font-medium border-none outline-none transition-all"
                  style={{ background: "var(--surface-container-lowest)", color: "var(--on-surface)", boxShadow: "0 1px 3px rgba(25,28,30,0.08)" }}
                  onFocus={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px var(--primary)40`}
                  onBlur={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(25,28,30,0.08)"}
                  placeholder="Search for companies, roles, or salaries..."
                  value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && research()} />
              </div>
              <button className="btn-primary-s px-8" onClick={() => research()} disabled={loading}>
                {loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span> : "Research"}
              </button>
            </div>

            {/* Popular chips */}
            {!data && (
              <div className="flex flex-wrap gap-2 mt-4">
                {POPULAR.map(co => (
                  <button key={co} onClick={() => { setQuery(co); research(co); }}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                    style={{ background: "var(--surface-container-lowest)", color: "var(--on-surface-variant)", border: "1px solid var(--outline-variant)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--outline-variant)"}>
                    {co}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 28, color: "var(--primary)" }}>progress_activity</span>
              <span style={{ color: "var(--on-surface-variant)" }}>Researching {query}...</span>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Company header — from Stitch: white card, logo, stars */}
              <div className="card-stitch p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 border"
                      style={{ background: "var(--surface-container-lowest)", borderColor: "var(--surface-container)" }}>
                      <span className="text-4xl font-black" style={{ color: "var(--primary)", fontFamily: "var(--font-headline)" }}>
                        {data.name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                          {data.name}
                        </h1>
                        {data.hiring && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                            style={{ background: hiringBadge[data.hiring].bg, color: hiringBadge[data.hiring].color }}>
                            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 12 }}>check_circle</span>
                            {hiringBadge[data.hiring].label}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-lg mb-2" style={{ color: "var(--on-surface-variant)" }}>
                        {data.industry} • {data.size}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex" style={{ color: "#f59e0b" }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined"
                              style={{ fontSize: 18, fontVariationSettings: i < Math.round(data.rating) ? "'FILL' 1" : "'FILL' 0" }}>
                              star
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-xl" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                          {data.rating}
                        </span>
                        <span className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
                          ({(data.reviewCount / 1000).toFixed(1)}k Reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 rounded-xl font-bold transition-all"
                      style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}>
                      Follow
                    </button>
                    <button className="btn-primary-s px-8 py-3">View Jobs</button>
                  </div>
                </div>

                {/* Tech stack */}
                <div className="mt-8 pt-8 flex flex-wrap items-center gap-3"
                  style={{ borderTop: "1px solid var(--surface-container)" }}>
                  <span className="text-xs font-bold uppercase tracking-widest mr-2"
                    style={{ color: "var(--on-surface-variant)" }}>Tech Stack</span>
                  {data.techStack.map(t => (
                    <div key={t} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: "var(--surface-container)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--primary)" }}>code</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bento grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ratings */}
                <div className="card-stitch p-8">
                  <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Experience Breakdown
                  </h3>
                  <div className="space-y-6">
                    {data.ratings.map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-medium" style={{ color: "var(--on-surface-variant)" }}>{label}</span>
                          <span className="font-bold" style={{ color: "var(--secondary)" }}>{value}</span>
                        </div>
                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--surface-container)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(value / 5) * 100}%`, background: "var(--primary)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salary ranges */}
                <div className="card-stitch p-8">
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Salary Ranges
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--on-surface-variant)" }}>
                    Market-leading compensation for Engineering
                  </p>
                  <div className="space-y-4">
                    {data.salaryRanges.map(({ role, min, max }) => (
                      <div key={role} className="flex items-center justify-between p-4 rounded-2xl"
                        style={{ background: "var(--surface-container-low)" }}>
                        <div>
                          <span className="block text-xs font-bold uppercase" style={{ color: "var(--on-surface-variant)" }}>{role}</span>
                          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
                            ₹ {min}—{max} <span className="text-sm">LPA</span>
                          </span>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>trending_up</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="card-stitch p-8">
                  <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Pros & Cons
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: "var(--secondary)" }}>
                        <span className="material-symbols-outlined mat-fill" style={{ fontSize: 18 }}>thumb_up</span>
                        ADVANTAGES
                      </h4>
                      <ul className="space-y-3">
                        {data.pros.map((p, i) => (
                          <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 14, color: "var(--secondary)" }}>add</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: "var(--error)" }}>
                        <span className="material-symbols-outlined mat-fill" style={{ fontSize: 18 }}>thumb_down</span>
                        CHALLENGES
                      </h4>
                      <ul className="space-y-3">
                        {data.cons.map((c, i) => (
                          <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 14, color: "var(--error)" }}>remove</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Interview process */}
                <div className="card-stitch p-8">
                  <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Interview Process
                  </h3>
                  <div className="flex flex-col gap-6">
                    {data.interviewProcess.map(({ step, desc }, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                          {i + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm" style={{ color: "var(--on-surface)" }}>{step}</h5>
                          <p className="text-xs mt-0.5" style={{ color: "var(--on-surface-variant)" }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 rounded-2xl flex items-center justify-between"
                    style={{ background: "#f0fdf4" }}>
                    <span className="text-sm font-bold" style={{ color: "#166534" }}>Difficulty: Hard</span>
                    <button className="text-sm font-bold flex items-center gap-1" style={{ color: "var(--primary)" }}>
                      Read Experiences
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="card-stitch p-6" style={{ borderLeft: "4px solid var(--primary)" }}>
                <p className="font-bold mb-1" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>AI Verdict</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>{data.verdict}</p>
              </div>
            </div>
          )}

          {!data && !loading && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--outline-variant)" }}>corporate_fare</span>
              <p className="font-bold text-xl mt-4" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                Research any company
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>
                Get salary data, culture insights, and interview prep for Indian tech companies
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyResearch;
