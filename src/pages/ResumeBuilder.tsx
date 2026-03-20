import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

interface WorkExp { id: string; title: string; company: string; start: string; end: string; current: boolean; bullets: string[]; }
interface Education { id: string; degree: string; college: string; year: string; cgpa: string; }
interface ResumeData {
  name: string; email: string; phone: string; location: string;
  linkedin: string; github: string; summary: string; skills: string[];
  experience: WorkExp[]; education: Education[]; certifications: string[];
}

const STEPS = [
  { id: "basics",     label: "Basics",     icon: "person",      done: true  },
  { id: "experience", label: "Experience", icon: "work",        active: true },
  { id: "education",  label: "Education",  icon: "school"       },
  { id: "skills",     label: "Skills",     icon: "bolt"         },
  { id: "preview",    label: "Preview",    icon: "visibility"   },
];

const uid = () => Math.random().toString(36).slice(2, 8);

const ResumeBuilder = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 0-based index
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("Senior Product Designer");
  const [data, setData] = useState<ResumeData>({
    name: "", email: "", phone: "", location: city.name,
    linkedin: "", github: "", summary: "",
    skills: [], experience: [{
      id: uid(), title: "Senior Product Designer", company: "Design Systems Inc.",
      start: "Jan 2021", end: "Present", current: true,
      bullets: [
        "Led the design of a comprehensive component library utilized by 4 cross-functional teams, reducing UI development time by 35%",
        "Collaborated with engineering leadership to implement a new design handoff process using Token Studio",
        ""
      ]
    }],
    education: [], certifications: [],
  });

  const upd = (field: keyof ResumeData, value: any) => setData(d => ({ ...d, [field]: value }));

  const generateBullets = async (expId: string) => {
    const exp = data.experience.find(e => e.id === expId);
    if (!exp?.title) { toast({ title: "Enter job title first", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const prompt = `Generate 4 strong resume bullet points for a ${exp.title} at ${exp.company || "a tech company"} in India.
Start each with a strong action verb. Include metrics. ATS-friendly for Indian companies.
Return ONLY a JSON array of 4 strings: ["bullet1","bullet2","bullet3","bullet4"]`;
      const raw = await callAI(null, prompt);
      const bullets = safeParseJSON<string[]>(raw, []);
      if (bullets.length) {
        setData(d => ({
          ...d,
          experience: d.experience.map(e =>
            e.id === expId ? { ...e, bullets: [...bullets, ""] } : e
          ),
        }));
        toast({ title: "Bullets generated!" });
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const addExp = () => setData(d => ({
    ...d,
    experience: [...d.experience, {
      id: uid(), title: "", company: "", start: "", end: "Present",
      current: false, bullets: ["", "", ""]
    }]
  }));

  const updateBullet = (expId: string, idx: number, value: string) =>
    setData(d => ({
      ...d,
      experience: d.experience.map(e =>
        e.id === expId
          ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? value : b) }
          : e
      )
    }));

  const inputStyle = {
    background: "var(--surface-container-high)", border: "none", outline: "none",
    borderRadius: "0.75rem", padding: "1rem 1.25rem", fontSize: "0.875rem",
    fontWeight: 500, color: "var(--on-surface)", width: "100%", transition: "all 0.15s",
    fontFamily: "var(--font-body)",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)";
    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.2)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)";
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
  };

  return (
    <DashboardLayout title="Resume Builder">
      <div className="min-h-screen pb-12" style={{ background: "var(--surface-container-low)" }}>
        <div className="max-w-5xl mx-auto px-8 py-12">

          {/* Breadcrumb nav — from Stitch */}
          <div className="flex items-center justify-between mb-12 px-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => setStep(i)}
                  className="flex items-center gap-2 transition-opacity"
                  style={{ opacity: i > step ? 0.4 : 1 }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: i < step ? "var(--secondary-container)" : i === step ? "var(--primary)" : "var(--surface-container)",
                      boxShadow: i === step ? "0 4px 12px var(--primary)30" : "none",
                    }}>
                    {i < step ? (
                      <span className="material-symbols-outlined mat-fill text-white" style={{ fontSize: 14 }}>check</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{
                        fontSize: 14,
                        color: i === step ? "white" : "var(--on-surface-variant)",
                        fontVariationSettings: i === step ? "'FILL' 1" : "'FILL' 0",
                      }}>{s.icon}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-label)",
                      color: i === step ? "var(--primary)" : i < step ? "var(--on-surface-variant)" : "var(--on-surface-variant)",
                      fontWeight: i === step ? 700 : 600,
                    }}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="h-px flex-1 mx-4 w-12" style={{ background: "var(--surface-container)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Page title */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                {STEPS[step].label === "Basics" ? "Personal Information"
                  : STEPS[step].label === "Experience" ? "Professional Experience"
                  : STEPS[step].label === "Education" ? "Education"
                  : STEPS[step].label === "Skills" ? "Skills & Certifications"
                  : "Preview & Download"}
              </h1>
              <p style={{ color: "var(--on-surface-variant)", maxWidth: 480 }}>
                {step === 1 ? "Detail your work history. Use our AI assistant to craft impactful bullet points." : "Complete each section to build your perfect resume."}
              </p>
            </div>
            {step === 1 && (
              <button className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors"
                style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}
                onClick={addExp}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Add New Role
              </button>
            )}
          </div>

          {/* Main form — glassmorphic card from Stitch */}
          <div className="p-10 rounded-3xl shadow-2xl mb-10"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 24px 48px rgba(25,28,30,0.10)",
            }}>

            {/* Step 0: Basics */}
            {step === 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[["Full Name","name","Chaitanya Sai"],["Email","email","you@example.com"],["Phone","phone","+91 98765 43210"],["Location","location",city.name],["LinkedIn URL","linkedin","linkedin.com/in/yourname"],["GitHub URL","github","github.com/yourname"]].map(([label,key,ph]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-xs font-bold ml-1" style={{ color: "var(--on-surface-variant)" }}>{label}</label>
                      <input style={inputStyle} placeholder={ph} value={(data as any)[key]}
                        onChange={e => upd(key as any, e.target.value)}
                        onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold" style={{ color: "var(--on-surface-variant)" }}>Professional Summary</label>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
                      style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                      <span className="material-symbols-outlined mat-fill" style={{ fontSize: 14 }}>bolt</span>
                      AI Generate
                    </button>
                  </div>
                  <textarea rows={4} style={{ ...inputStyle, resize: "none", minHeight: 100 }}
                    placeholder="Write a compelling professional summary..."
                    value={data.summary} onChange={e => upd("summary", e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} />
                </div>
              </div>
            )}

            {/* Step 1: Experience */}
            {step === 1 && (
              <div className="space-y-12">
                {data.experience.map((exp, expIdx) => (
                  <section key={exp.id} className="space-y-8">
                    {expIdx > 0 && (
                      <div className="h-px w-full opacity-50"
                        style={{ background: "linear-gradient(to right, transparent, var(--surface-container-highest), transparent)" }} />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold ml-1" style={{ color: "var(--on-surface-variant)" }}>Job Title</label>
                        <div className="relative">
                          <input style={{ ...inputStyle, paddingRight: "3rem" }}
                            placeholder="Senior Product Designer"
                            value={exp.title} onChange={e => setData(d => ({ ...d, experience: d.experience.map(ex => ex.id === exp.id ? { ...ex, title: e.target.value } : ex) }))}
                            onFocus={onFocus} onBlur={onBlur} />
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--primary)", fontSize: 18 }}>magic_button</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold ml-1" style={{ color: "var(--on-surface-variant)" }}>Company</label>
                        <input style={inputStyle} placeholder="Design Systems Inc."
                          value={exp.company} onChange={e => setData(d => ({ ...d, experience: d.experience.map(ex => ex.id === exp.id ? { ...ex, company: e.target.value } : ex) }))}
                          onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold ml-1" style={{ color: "var(--on-surface-variant)" }}>Start Date</label>
                        <input style={inputStyle} placeholder="Jan 2021"
                          value={exp.start} onChange={e => setData(d => ({ ...d, experience: d.experience.map(ex => ex.id === exp.id ? { ...ex, start: e.target.value } : ex) }))}
                          onFocus={onFocus} onBlur={onBlur} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold ml-1" style={{ color: "var(--on-surface-variant)" }}>End Date</label>
                        <input style={inputStyle} placeholder="Present"
                          value={exp.end} disabled={exp.current}
                          onChange={e => setData(d => ({ ...d, experience: d.experience.map(ex => ex.id === exp.id ? { ...ex, end: e.target.value } : ex) }))}
                          onFocus={onFocus} onBlur={onBlur} />
                      </div>
                      <div className="flex items-end pb-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div className="w-6 h-6 rounded flex items-center justify-center cursor-pointer"
                            style={{ background: exp.current ? "var(--primary)" : "var(--surface-container-high)" }}
                            onClick={() => setData(d => ({ ...d, experience: d.experience.map(ex => ex.id === exp.id ? { ...ex, current: !ex.current, end: !ex.current ? "Present" : "" } : ex) }))}>
                            {exp.current && <span className="material-symbols-outlined text-white mat-fill" style={{ fontSize: 14 }}>check</span>}
                          </div>
                          <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>Currently working here</span>
                        </label>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest ml-1"
                          style={{ color: "var(--on-surface-variant)" }}>
                          Achievements & Responsibilities
                        </label>
                        <button onClick={() => generateBullets(exp.id)} disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
                          style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)", boxShadow: "0 4px 12px var(--secondary-container)40" }}>
                          {loading
                            ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 14 }}>progress_activity</span>
                            : <span className="material-symbols-outlined mat-fill" style={{ fontSize: 14 }}>bolt</span>}
                          AI Generate Bullet Points
                        </button>
                      </div>
                      <div className="space-y-3">
                        {exp.bullets.map((bullet, i) => (
                          <div key={i} className="flex gap-4 group">
                            <div className="mt-4 w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: bullet ? "var(--primary-fixed)" : "var(--outline-variant)" }} />
                            {bullet ? (
                              <div className="flex-1 px-6 py-4 rounded-2xl text-sm leading-relaxed"
                                style={{ background: "var(--surface-container)", color: "var(--on-surface-variant)" }}>
                                {bullet}
                              </div>
                            ) : (
                              <input style={{ ...inputStyle, background: "var(--surface-container)", borderRadius: "1rem" }}
                                placeholder="Type a new responsibility or use the AI generator above..."
                                value={bullet} onChange={e => updateBullet(exp.id, i, e.target.value)}
                                onFocus={onFocus} onBlur={onBlur} />
                            )}
                          </div>
                        ))}
                        <button onClick={() => setData(d => ({ ...d, experience: d.experience.map(e => e.id === exp.id ? { ...e, bullets: [...e.bullets, ""] } : e) }))}
                          className="text-xs font-semibold flex items-center gap-1 ml-6 transition-colors"
                          style={{ color: "var(--primary)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                          Add bullet
                        </button>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* Steps 2-4: placeholder */}
            {step === 2 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--outline-variant)" }}>school</span>
                <p className="font-bold mt-4" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>Education section</p>
                <p className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>Add your degrees, colleges, and CGPA</p>
              </div>
            )}
            {step === 3 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--outline-variant)" }}>bolt</span>
                <p className="font-bold mt-4" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>Skills section</p>
                <p className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>Add your technical skills and certifications</p>
              </div>
            )}
            {step === 4 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--primary)" }}>description</span>
                <p className="font-bold mt-4" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>Your resume is ready!</p>
                <p className="text-sm mt-1 mb-6" style={{ color: "var(--on-surface-variant)" }}>Download as HTML and print as PDF</p>
                <button className="btn-primary-s px-8 py-4">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                  Download Resume
                </button>
              </div>
            )}

            {/* Footer nav */}
            <div className="flex items-center justify-between pt-10 mt-10"
              style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-colors"
                style={{ color: "var(--on-surface)" }}
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                Previous
              </button>
              <div className="flex gap-4">
                <button className="px-8 py-4 rounded-xl font-bold text-sm transition-colors"
                  style={{ color: "var(--on-surface-variant)" }}>
                  Save for Later
                </button>
                <button className="btn-primary-s px-10 py-4 text-sm"
                  onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                  disabled={step === STEPS.length - 1}>
                  Next Step
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Help cards — from Stitch */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "lightbulb", title: "Editorial Tip",    body: "Keep bullet points focused on outcomes. Use words like 'Spearheaded,' 'Optimized,' 'Orchestrated.'" },
              { icon: "trending_up", title: "Quantify Results", body: "Instead of 'Improved workflow,' use 'Improved workflow efficiency by 22% over 3 quarters.'" },
              { icon: "verified", title: "ATS Optimization",  body: "Our AI ensures your bullet points are readable by automated systems while maintaining a human narrative." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="p-6 rounded-3xl" style={{ background: "var(--surface-container-low)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: "white" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 18 }}>{icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeBuilder;
