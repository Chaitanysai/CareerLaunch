import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { analyzeResume, matchJobs } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import JobCard from "@/components/jobs/JobCard";

interface MatchResult {
  score: number;
  verdict: string;
  missingKeywords: string[];
  foundKeywords: string[];
  tips: string[];
}

const ResumeMatcher = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("We are looking for a Senior Product Engineer with 5+ years of experience in React, Node.js, and Cloud Infrastructure (AWS). You should be comfortable with Microservices architecture and have a strong focus on high-performance system design...");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB", variant: "destructive" }); return; }
    setFile(f);
  };

  const analyze = async () => {
    if (!file) { toast({ title: "Please upload your resume first", variant: "destructive" }); return; }
    setLoading(true);
    try {
      // Extract file content
      let content: { text?: string; base64?: string; mimeType?: string } = {};
      if (file.type === "application/pdf") {
        const base64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.onerror = () => rej(new Error("Read failed"));
          reader.readAsDataURL(file);
        });
        content = { base64, mimeType: "application/pdf" };
      } else {
        const text = await file.text();
        content = { text };
      }

      // Analyze resume
      const analysis = await analyzeResume(content, city.name);

      // Simple ATS match scoring against JD
      const jdWords = jd.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const skillsLower = analysis.skills.map(s => s.toLowerCase());
      const found = analysis.skills.filter(s =>
        jdWords.some(w => s.toLowerCase().includes(w) || w.includes(s.toLowerCase().substring(0, 4)))
      );
      const missing = ["AWS", "Terraform", "Redis", "Microservices", "CI/CD", "Kubernetes"]
        .filter(k => !skillsLower.some(s => s.includes(k.toLowerCase())));
      const score = Math.min(95, Math.max(40, Math.round((found.length / Math.max(analysis.skills.length, 1)) * 100)));

      setResult({
        score,
        verdict: score >= 85 ? "Excellent match!" : score >= 70 ? "Good potential, but needs work." : "Significant gaps detected.",
        missingKeywords: missing.slice(0, 5),
        foundKeywords: found.slice(0, 6),
        tips: [
          `Add "${missing[0] || 'cloud'}" and "${missing[1] || 'infrastructure'}" specifically to your Skills section`,
          "Quantify your results (e.g., 'Reduced latency by 40%') to stand out to AI scanners",
          "Use a standard single-column layout for better PDF parsing accuracy",
        ],
      });

      // Get job matches
      const matched = await matchJobs(content, city.name, analysis.skills);
      setJobs(matched.slice(0, 4));

    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const circumference = 2 * Math.PI * 88;
  const offset = result ? circumference - (circumference * result.score) / 100 : circumference;

  return (
    <DashboardLayout title="Resume Matcher">
      <div className="min-h-screen p-8 lg:p-12" style={{ background: "var(--surface-container-low)" }}>
        <header className="mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
            Resume Matcher
          </h2>
          <p className="max-w-2xl" style={{ color: "var(--on-surface-variant)" }}>
            Optimize your application for ATS by matching your resume against specific job descriptions.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: Inputs */}
          <div className="xl:col-span-7 flex flex-col gap-8">
            {/* Upload zone */}
            <section className="card-stitch p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>upload_file</span>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Resume Upload
                </h3>
              </div>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? "var(--primary)" : "rgba(0,0,0,0.12)",
                  background: dragging ? "rgba(0,79,52,0.04)" : "rgba(0,0,0,0.02)",
                }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                  e.preventDefault(); setDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                onClick={() => fileRef.current?.click()}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: "rgba(0,79,52,0.08)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>cloud_upload</span>
                </div>
                <p className="font-semibold mb-1" style={{ color: "var(--on-surface)" }}>
                  Drag and drop your resume here
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--on-surface-variant)" }}>
                  PDF, DOCX supported (Max 5MB)
                </p>
                <button className="btn-primary-s px-6 py-2.5 text-sm">Browse Files</button>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {file && (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: "var(--surface-container)" }}>
                  <span className="material-symbols-outlined mat-fill" style={{ color: "var(--secondary)", fontSize: 20 }}>check_circle</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--on-surface)" }}>{file.name}</p>
                    <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button onClick={() => setFile(null)}>
                    <span className="material-symbols-outlined transition-colors"
                      style={{ color: "var(--outline)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--error)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--outline)"}>
                      delete
                    </span>
                  </button>
                </div>
              )}
            </section>

            {/* JD input */}
            <section className="card-stitch p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>description</span>
                <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Match Against Job Description
                </h3>
              </div>
              <div className="relative">
                <textarea
                  className="w-full min-h-[250px] p-6 rounded-xl border-none text-sm leading-relaxed resize-none outline-none transition-all"
                  style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}
                  onFocus={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.2)";
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  placeholder="Paste the full job description here..."
                  value={jd} onChange={e => setJd(e.target.value)} />
                <div className="absolute bottom-4 right-4 text-xs font-medium" style={{ color: "var(--on-surface-variant)" }}>
                  {jd.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button className="btn-primary-s px-8 py-4 text-base" onClick={analyze} disabled={loading}>
                  {loading
                    ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>Analyzing...</>
                    : <><span>Analyze Matching Score</span><span className="material-symbols-outlined" style={{ fontSize: 16 }}>analytics</span></>}
                </button>
              </div>
            </section>
          </div>

          {/* Right: Results */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            {/* Score gauge — from Stitch SVG */}
            <section className="card-stitch p-8 text-center">
              <h3 className="text-xl font-semibold text-left mb-8"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                Analysis Results
              </h3>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent"
                    stroke="var(--surface-container-high)" strokeWidth="12" />
                  <circle cx="96" cy="96" r="88" fill="transparent"
                    stroke="var(--primary)" strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
                    {result ? result.score : "–"}<span className="text-2xl">%</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                    Match Score
                  </span>
                </div>
              </div>
              {result ? (
                <>
                  <p className="font-semibold mb-2" style={{ color: "var(--on-surface)" }}>{result.verdict}</p>
                  <p className="text-sm px-4" style={{ color: "var(--on-surface-variant)" }}>
                    Your resume matches {result.score}% of the required skills.
                  </p>
                </>
              ) : (
                <p style={{ color: "var(--on-surface-variant)" }}>Upload your resume and paste a JD to see your match score</p>
              )}
            </section>

            {result && (
              <>
                {/* Missing keywords */}
                <section className="card-stitch p-6">
                  <div className="flex items-center gap-2 mb-4" style={{ color: "var(--error)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error</span>
                    <h4 className="font-bold text-sm">Keywords Missing</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map(k => (
                      <span key={k} className="px-3 py-1.5 text-xs font-bold rounded-full"
                        style={{ background: "var(--error-container)", color: "var(--on-error-container)" }}>{k}</span>
                    ))}
                  </div>
                </section>

                {/* Found keywords */}
                <section className="card-stitch p-6">
                  <div className="flex items-center gap-2 mb-4" style={{ color: "var(--primary)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                    <h4 className="font-bold text-sm">Keywords Found</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.foundKeywords.map(k => (
                      <span key={k} className="px-3 py-1.5 text-xs font-bold rounded-full"
                        style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>{k}</span>
                    ))}
                  </div>
                </section>

                {/* ATS Tips */}
                <section className="p-6 rounded-3xl border"
                  style={{ background: "rgba(0,79,52,0.05)", borderColor: "var(--primary-fixed)" }}>
                  <div className="flex items-center gap-2 mb-4" style={{ color: "var(--primary)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lightbulb</span>
                    <h4 className="font-bold text-sm uppercase tracking-wide">ATS Optimization Tips</h4>
                  </div>
                  <ul className="space-y-3">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--on-surface)" }}>
                        <span className="font-bold" style={{ color: "var(--primary)" }}>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ background: "var(--primary)", color: "var(--on-primary)", boxShadow: "0 8px 24px var(--primary)25" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>magic_button</span>
                    One-click Optimize
                  </button>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Job matches */}
        {jobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6"
              style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Matched Jobs in {city.name}
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {jobs.map((job, i) => (
                <div key={i} className="animate-fade-in-up">
                  <JobCard job={{ ...job, source: "ai" }} city={city.name} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumeMatcher;
