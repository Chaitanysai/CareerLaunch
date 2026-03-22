import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { analyzeResume, matchJobs, callAI, safeParseJSON } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface MatchResult {
  score: number;
  verdict: string;
  missingKeywords: string[];
  foundKeywords: string[];
  tips: string[];
  skills: string[];
  suggestedTitle: string;
  salaryRange: { min: number; max: number };
}

interface MatchedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  matchScore: number;
  description: string;
  skills: string[];
  url?: string;
  applyLink?: string;
  postedDate: string;
  whyMatch: string;
  source: "ai" | "live";
}

/* ── Pill button ── */
const Pill = ({
  onClick, disabled, loading: busy, children, variant = "primary", fullWidth = false,
}: {
  onClick?: () => void; disabled?: boolean; loading?: boolean;
  children: React.ReactNode; variant?: "primary"|"outline"|"ghost"; fullWidth?: boolean;
}) => {
  const base: React.CSSProperties = {
    borderRadius: 999, fontFamily: "var(--font-headline)", fontWeight: 700,
    fontSize: "0.875rem", display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: "0.5rem", padding: "0.65rem 1.5rem",
    cursor: disabled || busy ? "not-allowed" : "pointer",
    opacity: disabled || busy ? 0.55 : 1, transition: "all 0.15s",
    border: "none", width: fullWidth ? "100%" : undefined,
  };
  const v: Record<string, React.CSSProperties> = {
    primary: { ...base, background: "var(--primary)", color: "white", boxShadow: "0 4px 14px var(--primary)40" },
    outline:  { ...base, background: "transparent", color: "var(--primary)", border: "2px solid var(--primary)" },
    ghost:    { ...base, background: "var(--surface-container)", color: "var(--on-surface)" },
  };
  return (
    <button style={v[variant]} onClick={!disabled && !busy ? onClick : undefined} disabled={disabled || busy}
      onMouseEnter={e => { if (!disabled && !busy) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = disabled || busy ? "0.55" : "1"; }}>
      {busy && <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>}
      {children}
    </button>
  );
};

/* ── Compact job card ── */
const JobRow = ({ job, city }: { job: MatchedJob; city: string }) => {
  const initColor = ["#fc8019","#2d6be4","#5f259f","#0cab6e","#e91e63","#ff5722"][
    job.company.charCodeAt(0) % 6
  ];
  return (
    <div className="card-stitch p-5 flex items-center justify-between gap-4 group cursor-pointer hover:shadow-md transition-all"
      onClick={() => window.open(job.applyLink || job.url || "#", "_blank")}>
      <div className="flex items-center gap-4 min-w-0">
        {/* Company initial */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl font-black"
          style={{ background: `${initColor}18`, color: initColor, fontFamily: "var(--font-headline)" }}>
          {job.company[0]}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-base" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              {job.title}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase"
              style={{ background: "rgba(0,79,52,0.10)", color: "var(--primary)" }}>
              {job.matchScore}% match
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--on-surface-variant)" }}>
            {job.company} · {job.location} · ₹{job.salaryMin}L–₹{job.salaryMax}L
          </p>
          {job.whyMatch && (
            <p className="text-xs mt-1 italic" style={{ color: "var(--primary)", opacity: 0.85 }}>
              ✓ {job.whyMatch}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs hidden md:block" style={{ color: "var(--outline)" }}>{job.postedDate}</span>
        <Pill variant="outline">Apply →</Pill>
      </div>
    </div>
  );
};

const ResumeMatcher = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const navigate  = useNavigate();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [file,       setFile]       = useState<File | null>(null);
  const [jd,         setJd]         = useState("");
  const [loading,    setLoading]    = useState(false);
  const [jobsLoading,setJobsLoading]= useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result,     setResult]     = useState<MatchResult | null>(null);
  const [jobs,       setJobs]       = useState<MatchedJob[]>([]);
  const [dragging,   setDragging]   = useState(false);
  const [optimizedBullets, setOptimizedBullets] = useState<string[]>([]);
  const [phase, setPhase] = useState<"upload"|"results">("upload");

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast({ title: "File too large — max 5MB", variant: "destructive" }); return; }
    setFile(f); setResult(null); setJobs([]); setOptimizedBullets([]); setPhase("upload");
  };

  const getContent = async () => {
    if (!file) return null;
    if (file.type === "application/pdf") {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(",")[1]);
        reader.onerror = () => rej(new Error("Read failed"));
        reader.readAsDataURL(file);
      });
      return { base64, mimeType: "application/pdf" };
    }
    return { text: await file.text() };
  };

  /* ── Step 1: Analyze resume ── */
  const analyze = async () => {
    if (!file) { toast({ title: "Upload your resume first", variant: "destructive" }); return; }
    setLoading(true);
    setOptimizedBullets([]);
    try {
      const content = await getContent();
      if (!content) return;

      const analysis = await analyzeResume(content, city.name);

      const jdLower = jd.toLowerCase();
      const found   = analysis.skills.filter(s => jdLower.includes(s.toLowerCase()));
      const allMissing = ["AWS","Terraform","Redis","Microservices","CI/CD","Kubernetes","Docker","GraphQL","Kafka","PostgreSQL"];
      const missing = allMissing
        .filter(k => !analysis.skills.map(s => s.toLowerCase()).some(s => s.includes(k.toLowerCase())))
        .filter(k => jd.trim() ? jdLower.includes(k.toLowerCase()) : true)
        .slice(0, 5);

      const score = jd.trim()
        ? Math.min(95, Math.max(35, Math.round((found.length / Math.max(analysis.skills.length, 1)) * 100)))
        : Math.min(88, Math.max(60, analysis.skills.length * 7));

      setResult({
        score,
        verdict: score >= 85 ? "Excellent match! 🎉" : score >= 70 ? "Good potential — a few gaps to fill." : "Significant gaps detected.",
        missingKeywords: missing,
        foundKeywords: found.slice(0, 8),
        tips: [
          `Add "${missing[0] || "cloud skills"}" specifically to your Skills section to boost ATS rank`,
          "Quantify results (e.g., 'Reduced latency by 40%') — ATS scanners love metrics",
          "Use a single-column layout for better PDF parsing accuracy",
        ],
        skills: analysis.skills,
        suggestedTitle: analysis.suggestedTitle,
        salaryRange: analysis.salaryRange,
      });

      setPhase("results");

      // ── Step 2: Fetch matched jobs (the PRIMARY feature) ──
      setJobsLoading(true);
      try {
        const matched = await matchJobs(content, city.name, analysis.skills);
        const jobList: MatchedJob[] = matched.map(j => ({ ...j, source: "ai" as const }));
        setJobs(jobList);
      } catch (jobErr: any) {
        toast({ title: "Job matching failed", description: jobErr.message, variant: "destructive" });
      } finally {
        setJobsLoading(false);
      }

    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ── One-click optimize ── */
  const optimize = async () => {
    if (!result) { toast({ title: "Run analysis first", variant: "destructive" }); return; }
    setOptimizing(true);
    try {
      const prompt = `ATS expert. Generate 5 strong resume bullet points for a ${result.suggestedTitle} role in ${city.name}.
Must naturally use these keywords: ${result.missingKeywords.join(", ")}
Context: ${jd.slice(0, 800) || "Senior tech role in Indian product company"}
Return ONLY JSON array of 5 strings: ["bullet1","bullet2","bullet3","bullet4","bullet5"]
Each bullet: strong verb + specific achievement + metric. No markdown.`;
      const raw = await callAI(null, prompt);
      const bullets = safeParseJSON<string[]>(raw, []);
      if (bullets.length > 0) {
        setOptimizedBullets(bullets);
        toast({ title: "✨ 5 optimized bullets generated!" });
      } else throw new Error("No bullets generated");
    } catch (err: any) {
      toast({ title: "Optimization failed", description: err.message, variant: "destructive" });
    } finally { setOptimizing(false); }
  };

  const circumference = 2 * Math.PI * 72;
  const offset = result ? circumference - (circumference * result.score) / 100 : circumference;
  const scoreColor = !result ? "var(--outline)"
    : result.score >= 85 ? "var(--secondary)"
    : result.score >= 70 ? "#3b82f6"
    : "var(--error)";

  return (
    <DashboardLayout title="Resume Matcher">
      <div className="min-h-screen" style={{ background: "var(--surface-container-low)" }}>

        {/* ── Hero header ── */}
        <div className="px-8 pt-8 pb-6 flex items-end justify-between flex-wrap gap-4"
          style={{ borderBottom: "1px solid var(--surface-container-high)" }}>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1"
              style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Resume Matcher
            </h1>
            <p style={{ color: "var(--on-surface-variant)" }}>
              Upload your resume → get matched to real jobs in{" "}
              <strong style={{ color: "var(--primary)" }}>{city.name}</strong> + ATS score
            </p>
          </div>
          <Pill onClick={analyze} loading={loading} disabled={!file}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>analytics</span>
            {loading ? "Analyzing resume..." : "Analyze & Match Jobs"}
          </Pill>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* ── LEFT: upload + JD ── */}
          <div className="xl:col-span-5 flex flex-col gap-6">

            {/* Upload */}
            <div className="card-stitch p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,79,52,0.10)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>upload_file</span>
                </div>
                <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Your Resume
                </h3>
              </div>

              {!file ? (
                <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-all"
                  style={{ borderColor: dragging ? "var(--primary)" : "var(--outline-variant)", background: dragging ? "rgba(0,79,52,0.04)" : "transparent" }}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => fileRef.current?.click()}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "var(--surface-container)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>cloud_upload</span>
                  </div>
                  <p className="font-semibold mb-1" style={{ color: "var(--on-surface)" }}>Drop your resume here</p>
                  <p className="text-sm mb-5" style={{ color: "var(--on-surface-variant)" }}>PDF or DOCX · Max 5MB</p>
                  <Pill variant="outline">Browse Files</Pill>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: "var(--surface-container)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,79,52,0.12)" }}>
                    <span className="material-symbols-outlined mat-fill" style={{ color: "var(--primary)", fontSize: 20 }}>description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--on-surface)" }}>{file.name}</p>
                    <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>{(file.size/1024/1024).toFixed(1)} MB · Ready to analyze</p>
                  </div>
                  <button onClick={() => { setFile(null); setResult(null); setJobs([]); setPhase("upload"); }}
                    style={{ color: "var(--outline)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--error)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--outline)"}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {/* JD */}
            <div className="card-stitch p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,79,52,0.10)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>work</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Job Description
                  </h3>
                  <p className="text-xs" style={{ color: "var(--outline)" }}>Optional — improves match score accuracy</p>
                </div>
              </div>
              <div className="relative">
                <textarea rows={7}
                  className="w-full p-4 rounded-2xl border-none text-sm leading-relaxed resize-none outline-none transition-all"
                  style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px var(--primary)40"; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  placeholder="Paste the job description here for precise ATS scoring..."
                  value={jd} onChange={e => setJd(e.target.value)} />
                <span className="absolute bottom-3 right-4 text-xs" style={{ color: "var(--outline)" }}>
                  {jd.split(/\s+/).filter(Boolean).length}w
                </span>
              </div>
              <div className="mt-4">
                <Pill onClick={analyze} loading={loading} disabled={!file} fullWidth>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>analytics</span>
                  {loading ? "Analyzing..." : "Analyze & Match Jobs"}
                </Pill>
              </div>
            </div>

            {/* ATS result */}
            {result && (
              <div className="card-stitch p-7 animate-fade-in-up">
                {/* Score ring + summary */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative shrink-0">
                    <svg width="80" height="80" className="-rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="72" fill="transparent" stroke="var(--surface-container-high)" strokeWidth="12" />
                      <circle cx="80" cy="80" r="72" fill="transparent" stroke={scoreColor} strokeWidth="12"
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black" style={{ fontFamily: "var(--font-headline)", color: scoreColor }}>
                        {result.score}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-base" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                      {result.verdict}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--on-surface-variant)" }}>
                      Suggested role: <strong style={{ color: "var(--primary)" }}>{result.suggestedTitle}</strong>
                    </p>
                    <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
                      Market salary: <strong>₹{result.salaryRange.min}L – ₹{result.salaryRange.max}L</strong>
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                {result.missingKeywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--error)" }}>
                      Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map(k => (
                        <span key={k} className="px-3 py-1 text-xs font-bold rounded-full"
                          style={{ background: "var(--error-container)", color: "var(--on-error-container)" }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.foundKeywords.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--primary)" }}>
                      Keywords Found
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.foundKeywords.map(k => (
                        <span key={k} className="px-3 py-1 text-xs font-bold rounded-full"
                          style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* One-click optimize */}
                <Pill onClick={optimize} loading={optimizing} fullWidth>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 18 }}>auto_awesome</span>
                  {optimizing ? "Generating bullets..." : "One-click Optimize"}
                </Pill>
              </div>
            )}

            {/* Optimized bullets */}
            {optimizedBullets.length > 0 && (
              <div className="card-stitch p-7 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    ✨ Optimized Bullet Points
                  </h3>
                  <Pill variant="ghost" onClick={() => { navigator.clipboard.writeText(optimizedBullets.join("\n\n")); toast({ title: "Copied!" }); }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>content_copy</span>
                    Copy
                  </Pill>
                </div>
                <div className="space-y-3">
                  {optimizedBullets.map((b, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-2xl text-sm leading-relaxed"
                      style={{ background: "var(--surface-container-low)", color: "var(--on-surface)" }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--primary)" }} />
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: MATCHED JOBS — the primary feature ── */}
          <div className="xl:col-span-7">

            {/* Empty state */}
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                  style={{ background: "var(--surface-container)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--outline)" }}>work_history</span>
                </div>
                <h2 className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Your matched jobs will appear here
                </h2>
                <p className="text-base mb-6 max-w-sm" style={{ color: "var(--on-surface-variant)" }}>
                  Upload your resume and click <strong>"Analyze & Match Jobs"</strong> to find roles in {city.name} tailored to your exact skill set.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {["React Developer","Data Scientist","Product Manager","DevOps Engineer"].map(r => (
                    <span key={r} className="px-4 py-2 rounded-full text-sm font-semibold"
                      style={{ background: "var(--surface-container)", color: "var(--on-surface-variant)" }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state for jobs */}
            {(loading || jobsLoading) && (
              <div>
                <div className="flex items-center gap-3 mb-6 px-1">
                  <span className="material-symbols-outlined animate-spin" style={{ color: "var(--primary)", fontSize: 22 }}>progress_activity</span>
                  <p className="font-semibold" style={{ color: "var(--on-surface)" }}>
                    {loading ? "Analyzing your resume..." : `Finding matched jobs in ${city.name}...`}
                  </p>
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card-stitch p-5 mb-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl" style={{ background: "var(--surface-container)" }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 rounded-full w-2/3" style={{ background: "var(--surface-container)" }} />
                        <div className="h-3 rounded-full w-1/2" style={{ background: "var(--surface-container)" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── MATCHED JOBS — hero section ── */}
            {jobs.length > 0 && !loading && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-5 px-1">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                      {jobs.length} Matched Jobs
                    </h2>
                    <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
                      AI-matched to your resume for {city.name}
                    </p>
                  </div>
                  <Pill variant="ghost" onClick={() => navigate("/jobs")}>
                    View Job Board →
                  </Pill>
                </div>

                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
                      <JobRow job={job} city={city.name} />
                    </div>
                  ))}
                </div>

                {/* CTA to full job board */}
                <div className="mt-8 p-6 rounded-3xl text-center"
                  style={{ background: `linear-gradient(135deg, var(--hero-mid, #004433), var(--primary))` }}>
                  <p className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-headline)" }}>
                    Want more matches?
                  </p>
                  <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.70)" }}>
                    Explore 50K+ live jobs across {city.name} and India
                  </p>
                  <Pill variant="outline"
                    onClick={() => navigate("/jobs")}
                    // override outline style to be white on dark bg
                  >
                    <span style={{ color: "white", borderColor: "white" }}>
                      Browse Full Job Board →
                    </span>
                  </Pill>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeMatcher;
