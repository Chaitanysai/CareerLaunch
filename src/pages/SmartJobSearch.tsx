import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { analyzeResume } from "@/services/gemini";
import { searchJobs, normaliseJSearchJob } from "@/services/jsearch";
import { buildPortalLinks } from "@/lib/portals";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ──────────────────────────────────────────────────── */
interface LiveJob {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  matchScore: number;
  description: string;
  skills: string[];
  applyLink: string;
  postedDate: string;
  isRemote: boolean;
  source: "live" | "ai";
  whyMatch: string;
}

interface ResumeProfile {
  suggestedTitle: string;
  skills: string[];
  experience: string;
  salaryRange: { min: number; max: number };
}

/* ─── Pill button ─────────────────────────────────────────────── */
const Pill = ({
  onClick, disabled, loading: busy, children, variant = "primary", size = "md",
}: {
  onClick?: () => void; disabled?: boolean; loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "green";
  size?: "sm" | "md" | "lg";
}) => {
  const pad = size === "sm" ? "0.4rem 1rem" : size === "lg" ? "0.875rem 2rem" : "0.625rem 1.4rem";
  const fz  = size === "sm" ? "0.78rem" : size === "lg" ? "1rem" : "0.875rem";
  const base: React.CSSProperties = {
    borderRadius: 999, fontFamily: "var(--font-headline)", fontWeight: 700,
    fontSize: fz, display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: "0.4rem", padding: pad, cursor: disabled || busy ? "not-allowed" : "pointer",
    opacity: disabled || busy ? 0.55 : 1, transition: "all 0.15s", border: "none",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: "var(--primary)", color: "white", boxShadow: "0 4px 12px var(--primary)35" },
    outline:  { ...base, background: "transparent", color: "var(--primary)", border: "2px solid var(--primary)" },
    ghost:    { ...base, background: "var(--surface-container)", color: "var(--on-surface)" },
    green:    { ...base, background: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  };
  return (
    <button style={styles[variant]} onClick={!disabled && !busy ? onClick : undefined} disabled={disabled || busy}
      onMouseEnter={e => { if (!disabled && !busy) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = disabled || busy ? "0.55" : "1"; }}>
      {busy && <span className="material-symbols-outlined animate-spin" style={{ fontSize: 15 }}>progress_activity</span>}
      {children}
    </button>
  );
};

/* ─── Portal apply buttons ────────────────────────────────────── */
const PortalButtons = ({ title, city, applyLink }: { title: string; city: string; applyLink?: string }) => {
  const links = buildPortalLinks(title, city, applyLink).slice(0, 4);
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map(l => (
        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 hover:scale-105"
          style={{ background: l.color }}>
          {l.name}
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>open_in_new</span>
        </a>
      ))}
    </div>
  );
};

/* ─── Job card ────────────────────────────────────────────────── */
const JobCard = ({ job, city }: { job: LiveJob; city: string }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = ["#fc8019","#2d6be4","#5f259f","#0cab6e","#e91e63","#ff5722","#00897b","#1565c0"];
  const color = colors[job.company.charCodeAt(0) % colors.length];
  const scoreColor = job.matchScore >= 85 ? "var(--secondary)" : job.matchScore >= 70 ? "#3b82f6" : "var(--outline)";

  return (
    <div className="card-stitch overflow-hidden transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Company logo / initial */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border"
            style={{ background: `${color}14`, borderColor: `${color}22` }}>
            {job.logo
              ? <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-2"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <span className="text-2xl font-black" style={{ color, fontFamily: "var(--font-headline)" }}>
                  {job.company[0]}
                </span>
            }
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-lg leading-tight"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                {job.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {/* Match score badge */}
                <span className="px-3 py-1 rounded-full text-xs font-black"
                  style={{ background: `${scoreColor}18`, color: scoreColor }}>
                  {job.matchScore}% match
                </span>
                {/* Live badge */}
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black"
                  style={{ background: "rgba(0,200,100,0.12)", color: "#0d9453" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Meta */}
            <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--primary)" }}>{job.company}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: "var(--on-surface-variant)" }}>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                {job.isRemote ? "Remote / WFH" : job.location}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>work</span>
                {job.type}
              </span>
              {(job.salaryMin > 0 || job.salaryMax > 0) && (
                <span className="flex items-center gap-1 font-bold" style={{ color: "var(--on-surface)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>payments</span>
                  ₹{job.salaryMin}L – ₹{job.salaryMax}L
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                {job.postedDate}
              </span>
            </div>

            {/* Why match */}
            {job.whyMatch && (
              <p className="text-xs mt-2 px-3 py-1.5 rounded-xl italic"
                style={{ background: "rgba(0,79,52,0.06)", color: "var(--primary)" }}>
                ✓ {job.whyMatch}
              </p>
            )}

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 5).map(s => (
                <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: "var(--surface-container)", color: "var(--on-surface-variant)" }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Apply buttons */}
            <PortalButtons title={job.title} city={job.location} applyLink={job.applyLink} />
          </div>
        </div>

        {/* Description expand */}
        {expanded && (
          <div className="mt-4 pt-4 text-sm leading-relaxed"
            style={{ borderTop: "1px solid var(--surface-container-high)", color: "var(--on-surface-variant)" }}>
            {job.description}
          </div>
        )}
      </div>

      {/* Toggle */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
        style={{
          borderTop: "1px solid var(--surface-container-high)",
          color: "var(--outline)",
          background: "var(--surface-container-low)",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--primary)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--outline)"}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {expanded ? "expand_less" : "expand_more"}
        </span>
        {expanded ? "Show less" : "Show details & more portals"}
      </button>
    </div>
  );
};

/* ─── Main page ───────────────────────────────────────────────── */
const SmartJobSearch = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file,    setFile]    = useState<File | null>(null);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [jobs,    setJobs]    = useState<LiveJob[]>([]);
  const [phase,   setPhase]   = useState<"idle"|"parsing"|"searching"|"done">("idle");
  const [filter,  setFilter]  = useState({ remote: false, type: "", minScore: 0 });
  const [sortBy,  setSortBy]  = useState<"match"|"salary"|"recent">("match");
  const [extraRole, setExtraRole] = useState("");

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast({ title: "File too large — max 5MB", variant: "destructive" }); return; }
    setFile(f); setProfile(null); setJobs([]); setPhase("idle");
  };

  const findJobs = async () => {
    if (!file) { toast({ title: "Upload your resume first", variant: "destructive" }); return; }
    setJobs([]); setProfile(null);

    // ── Step 1: Parse resume ──────────────────────────────────
    setPhase("parsing");
    let resumeProfile: ResumeProfile;
    try {
      let content: { text?: string; base64?: string; mimeType?: string };
      if (file.type === "application/pdf") {
        const base64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.onerror = () => rej(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
        content = { base64, mimeType: "application/pdf" };
      } else {
        content = { text: await file.text() };
      }

      const analysis = await analyzeResume(content, city.name);
      resumeProfile = {
        suggestedTitle: analysis.suggestedTitle,
        skills: analysis.skills,
        experience: analysis.experience,
        salaryRange: analysis.salaryRange,
      };
      setProfile(resumeProfile);
    } catch (err: any) {
      toast({ title: "Could not parse resume", description: err.message, variant: "destructive" });
      setPhase("idle"); return;
    }

    // ── Step 2: Search live jobs from JSearch (LinkedIn/Indeed/Glassdoor/Naukri) ──
    setPhase("searching");
    const queries = [
      resumeProfile.suggestedTitle,
      ...(extraRole ? [extraRole] : []),
      ...(resumeProfile.skills.slice(0, 2).map(s => `${s} developer`)),
    ].slice(0, 3);

    const allJobs: LiveJob[] = [];

    for (const query of queries) {
      try {
        const raw = await searchJobs({
          query,
          location: city.name,
          datePosted: "month",
          page: 1,
        });

        const normalised = raw.map((j, i) => {
          const base = normaliseJSearchJob(j);
          // Calculate match score based on skill overlap
          const jobText = (j.job_title + " " + j.job_description).toLowerCase();
          const matchingSkills = resumeProfile.skills.filter(s =>
            jobText.includes(s.toLowerCase())
          );
          const score = Math.min(98, 50 + Math.round((matchingSkills.length / Math.max(resumeProfile.skills.length, 1)) * 48));

          return {
            ...base,
            matchScore: score,
            whyMatch: matchingSkills.length > 0
              ? `Your ${matchingSkills.slice(0, 2).join(" & ")} skills match this role`
              : `Matches your ${resumeProfile.suggestedTitle} profile`,
            source: "live" as const,
          } as LiveJob;
        });

        allJobs.push(...normalised);
      } catch (err: any) {
        // Quota exceeded — skip this query
        if (!err.message?.includes("quota")) {
          console.warn("JSearch error:", err.message);
        }
      }
    }

    // Deduplicate by job id + sort by match score
    const seen = new Set<string>();
    const unique = allJobs
      .filter(j => { if (seen.has(j.id)) return false; seen.add(j.id); return true; })
      .sort((a, b) => b.matchScore - a.matchScore);

    setJobs(unique);
    setPhase("done");

    if (unique.length === 0) {
      toast({
        title: "No live jobs found",
        description: "JSearch quota may be exceeded. Try again tomorrow or upgrade your RapidAPI plan.",
        variant: "destructive",
      });
    } else {
      toast({ title: `Found ${unique.length} live jobs matched to your resume!` });
    }
  };

  // ── Filtered + sorted jobs ─────────────────────────────────
  const displayed = jobs
    .filter(j =>
      (!filter.remote   || j.isRemote) &&
      (!filter.type     || j.type.toLowerCase().includes(filter.type.toLowerCase())) &&
      (j.matchScore >= filter.minScore)
    )
    .sort((a, b) =>
      sortBy === "match"  ? b.matchScore - a.matchScore :
      sortBy === "salary" ? b.salaryMax - a.salaryMax   :
      a.postedDate.localeCompare(b.postedDate)
    );

  const isLoading = phase === "parsing" || phase === "searching";

  return (
    <DashboardLayout title="Smart Job Search">
      <div className="min-h-screen" style={{ background: "var(--surface-container-low)" }}>

        {/* ── Header ── */}
        <div className="px-8 pt-8 pb-6"
          style={{ borderBottom: "1px solid var(--surface-container-high)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Smart Job Search
                </h1>
                <p style={{ color: "var(--on-surface-variant)", maxWidth: 520 }}>
                  Upload your resume → we analyze your skills → instantly fetch <strong>real live jobs</strong> from
                  LinkedIn, Indeed, Glassdoor & Naukri tailored to your profile.
                </p>
              </div>
              {/* Source logos */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { name: "LinkedIn",    color: "#0a66c2" },
                  { name: "Indeed",      color: "#003a9b" },
                  { name: "Glassdoor",   color: "#0caa41" },
                  { name: "Naukri",      color: "#126bc5" },
                ].map(({ name, color }) => (
                  <span key={name} className="px-3 py-1.5 rounded-full text-xs font-black text-white"
                    style={{ background: color }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── LEFT: Upload + controls ── */}
            <div className="lg:col-span-4 space-y-5">

              {/* Upload card */}
              <div className="card-stitch p-6">
                <h3 className="font-bold text-base mb-4" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  1. Upload Your Resume
                </h3>

                {!file ? (
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-all"
                    style={{ borderColor: "var(--outline-variant)" }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                    onDragLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--outline-variant)"}
                    onDrop={e => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--outline-variant)";
                      const f = e.dataTransfer.files[0]; if (f) handleFile(f);
                    }}>
                    <span className="material-symbols-outlined mb-3" style={{ fontSize: 36, color: "var(--primary)" }}>
                      upload_file
                    </span>
                    <p className="font-semibold text-sm mb-1" style={{ color: "var(--on-surface)" }}>
                      Drop your resume here
                    </p>
                    <p className="text-xs mb-4" style={{ color: "var(--on-surface-variant)" }}>PDF or DOCX · Max 5MB</p>
                    <Pill variant="outline" size="sm">Browse Files</Pill>
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
                      <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button onClick={() => { setFile(null); setJobs([]); setProfile(null); setPhase("idle"); }}
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

              {/* Target role override */}
              <div className="card-stitch p-6">
                <h3 className="font-bold text-base mb-3" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  2. Target Role <span className="text-xs font-normal" style={{ color: "var(--outline)" }}>(optional)</span>
                </h3>
                <input className="w-full text-sm rounded-2xl px-4 py-3 border-none outline-none transition-all"
                  style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}
                  placeholder="e.g. Senior React Developer, Data Scientist..."
                  value={extraRole} onChange={e => setExtraRole(e.target.value)}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px var(--primary)40"; (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)"; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)"; }}
                />
                <p className="text-xs mt-2" style={{ color: "var(--outline)" }}>
                  Leave blank to auto-detect from resume
                </p>
              </div>

              {/* Find jobs button */}
              <Pill onClick={findJobs} loading={isLoading} disabled={!file} size="lg"
                fullWidth={true as any}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {isLoading ? "hourglass_empty" : "travel_explore"}
                </span>
                {phase === "parsing"   ? "Reading resume..."        :
                 phase === "searching" ? "Searching live jobs..."    :
                 "Find My Jobs"}
              </Pill>

              {/* Detected profile */}
              {profile && (
                <div className="card-stitch p-5 animate-fade-in-up">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--on-surface-variant)" }}>
                    Resume Profile Detected
                  </p>
                  <p className="font-bold mb-1" style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
                    {profile.suggestedTitle}
                  </p>
                  <p className="text-xs mb-3" style={{ color: "var(--on-surface-variant)" }}>
                    {profile.experience} · ₹{profile.salaryRange.min}L–{profile.salaryRange.max}L expected
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 8).map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              {jobs.length > 0 && (
                <div className="card-stitch p-5">
                  <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--on-surface-variant)" }}>
                    Filter Results
                  </p>
                  <div className="space-y-4">
                    {/* Remote toggle */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-semibold" style={{ color: "var(--on-surface)" }}>Remote only</span>
                      <div className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
                        style={{ background: filter.remote ? "var(--primary)" : "var(--surface-container-high)" }}
                        onClick={() => setFilter(f => ({ ...f, remote: !f.remote }))}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                          style={{ left: filter.remote ? "1.25rem" : "0.125rem" }} />
                      </div>
                    </label>

                    {/* Job type */}
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--on-surface-variant)" }}>Job Type</p>
                      <div className="flex flex-wrap gap-2">
                        {["", "Full-time", "Contract", "Internship"].map(t => (
                          <button key={t} onClick={() => setFilter(f => ({ ...f, type: t }))}
                            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={{
                              background: filter.type === t ? "var(--primary)" : "var(--surface-container)",
                              color: filter.type === t ? "white" : "var(--on-surface-variant)",
                            }}>
                            {t || "All"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Min match */}
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--on-surface-variant)" }}>
                        Min match: <strong style={{ color: "var(--primary)" }}>{filter.minScore}%</strong>
                      </p>
                      <input type="range" min={0} max={80} step={5}
                        value={filter.minScore}
                        onChange={e => setFilter(f => ({ ...f, minScore: Number(e.target.value) }))}
                        className="w-full" style={{ accentColor: "var(--primary)" }} />
                    </div>

                    {/* Sort */}
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--on-surface-variant)" }}>Sort by</p>
                      <div className="flex gap-2">
                        {[["match","Best Match"],["salary","Salary"],["recent","Recent"]].map(([v, l]) => (
                          <button key={v} onClick={() => setSortBy(v as any)}
                            className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={{
                              background: sortBy === v ? "var(--primary)" : "var(--surface-container)",
                              color: sortBy === v ? "white" : "var(--on-surface-variant)",
                            }}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Job results ── */}
            <div className="lg:col-span-8">

              {/* Idle empty state */}
              {phase === "idle" && (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-8">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                    style={{ background: `linear-gradient(135deg, var(--hero-mid, #004433), var(--primary))` }}>
                    <span className="material-symbols-outlined mat-fill text-white" style={{ fontSize: 44 }}>
                      travel_explore
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Upload resume to find live jobs
                  </h2>
                  <p className="text-lg mb-6 max-w-md" style={{ color: "var(--on-surface-variant)" }}>
                    We'll scan your skills and instantly pull matching jobs from LinkedIn, Indeed, Glassdoor & Naukri.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                    {[
                      { icon: "psychology",    label: "AI skill extraction" },
                      { icon: "travel_explore",label: "Live job search" },
                      { icon: "verified",      label: "Match scoring" },
                      { icon: "open_in_new",   label: "Direct apply links" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-2 p-3 rounded-2xl"
                        style={{ background: "var(--surface-container)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)" }}>{icon}</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--on-surface)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading skeletons */}
              {isLoading && (
                <div>
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
                    style={{ background: "var(--surface-container)" }}>
                    <span className="material-symbols-outlined animate-spin" style={{ color: "var(--primary)", fontSize: 24 }}>
                      progress_activity
                    </span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--on-surface)" }}>
                        {phase === "parsing" ? "Reading your resume with AI..." : `Searching LinkedIn, Indeed & Naukri in ${city.name}...`}
                      </p>
                      <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                        {phase === "parsing" ? "Extracting skills and experience" : "Matching live jobs to your profile"}
                      </p>
                    </div>
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="card-stitch p-5 mb-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl shrink-0" style={{ background: "var(--surface-container)" }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 rounded-full w-2/3" style={{ background: "var(--surface-container)" }} />
                          <div className="h-3 rounded-full w-1/3" style={{ background: "var(--surface-container)" }} />
                          <div className="h-3 rounded-full w-full" style={{ background: "var(--surface-container)" }} />
                          <div className="flex gap-2 pt-1">
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="h-7 w-20 rounded-full" style={{ background: "var(--surface-container)" }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {phase === "done" && (
                <div>
                  {/* Stats bar */}
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                        {displayed.length} jobs matched to your resume
                      </h2>
                      <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
                        Live results from LinkedIn · Indeed · Glassdoor · Naukri in {city.name}
                      </p>
                    </div>
                    <Pill variant="ghost" size="sm" onClick={findJobs} loading={isLoading}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                      Refresh
                    </Pill>
                  </div>

                  {displayed.length === 0 ? (
                    <div className="text-center py-16 card-stitch">
                      <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--outline-variant)" }}>
                        search_off
                      </span>
                      <p className="font-bold mt-4" style={{ color: "var(--on-surface)" }}>No jobs match current filters</p>
                      <p className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>Try lowering the minimum match score</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayed.map((job, i) => (
                        <div key={job.id || i} className="animate-fade-in-up"
                          style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                          <JobCard job={job} city={city.name} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartJobSearch;
