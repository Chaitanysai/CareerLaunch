import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import DashboardLayout from "@/components/layout/DashboardLayout";

const FEATURE_CARDS = [
  {
    icon: "psychology", iconBg: "rgba(255,255,255,0.15)", iconColor: "rgba(255,255,255,0.9)",
    title: "Analyze Resume",
    desc: "Deep-dive into your expertise with our neural semantic processor.",
    cta: "Start Analysis", href: "/match",
    ctaColor: "var(--secondary-fixed, #6ffbbe)",
  },
  {
    icon: "travel_explore", iconBg: "#dbeafe", iconColor: "#1d4ed8",
    title: "Browse Jobs",
    desc: "Explore high-impact roles curated specifically for your profile DNA.",
    cta: "Explore Openings", href: "/jobs",
    ctaColor: "#1d4ed8",
  },
  {
    icon: "record_voice_over", iconBg: "#fef3c7", iconColor: "#d97706",
    title: "Interview Prep",
    desc: "Simulate real-world scenarios with our specialized AI interviewers.",
    cta: "Start Practice", href: "/interview",
    ctaColor: "#d97706",
  },
];

const SKILLS = [
  { label: "React / Frontend", pct: 94, isAmber: false },
  { label: "System Design",    pct: 82, isAmber: false },
  { label: "Cloud / DevOps",   pct: 65, isAmber: true  },
];

const JOBS = [
  { co: "Swiggy",   color: "#fc8019", title: "Senior Frontend Architect",    meta: "Hyderabad • ₹32L – ₹48L", match: 98 },
  { co: "Razorpay", color: "#2d6be4", title: "Principal Engineer (Payments)", meta: "Remote/HYD • ₹45L – ₹60L", match: 95 },
  { co: "PhonePe",  color: "#5f259f", title: "Engineering Manager",           meta: "Hyderabad • ₹55L – ₹75L", match: 92 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { city } = useCity();

  // ── Always use first name only, never show email ──
  const firstName = (() => {
    if (!user) return "there";
    const name = user.name || "";
    // If name looks like an email, use prefix before @
    if (name.includes("@")) {
      return name.split("@")[0].replace(/[._-]/g, " ").split(" ")[0];
    }
    return name.split(" ")[0] || "there";
  })();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-8 min-h-screen" style={{ background: "var(--surface-container-low)" }}>

        {/* ── Hero — gradient from CSS vars, updates with theme ── */}
        <section
          className="rounded-[2rem] p-10 flex flex-col lg:flex-row items-center justify-between relative mb-10 shadow-xl overflow-hidden fade-up"
          style={{
            background: "linear-gradient(135deg, var(--hero-from, #001f10) 0%, var(--hero-mid, #004433) 55%, var(--hero-to, #006947) 100%)",
            minHeight: 240,
          }}
        >
          {/* Glow overlay */}
          <div className="absolute top-0 right-0 w-2/5 h-3/5 pointer-events-none"
            style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 70%)" }} />

          <div className="relative z-10 max-w-2xl">
            {/* AI Intelligence label */}
            <div className="inline-flex items-center px-3 py-1 rounded-full mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "white" }}>
                AI Intelligence
              </span>
            </div>

            {/* Greeting — ONLY first name, never email */}
            <h1 className="font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}>
              {greeting}, <span className="capitalize">{firstName}</span>.<br />
              <span style={{ color: "var(--secondary-fixed, #6ffbbe)" }}>Architect your career</span>{" "}
              with CareerLaunch AI.
            </h1>

            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.70)" }}>
              Let our AI matching engine analyze your unique skill DNA to find high-impact roles in{" "}
              <strong style={{ color: "rgba(255,255,255,0.95)" }}>{city.name}</strong> that others miss.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => navigate("/match")}
                className="px-6 py-3 font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  color: "var(--secondary-fixed, #6ffbbe)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  fontFamily: "var(--font-headline)",
                }}>
                Analyze My Resume ✦
              </button>
              <button onClick={() => navigate("/career-roadmap")}
                className="px-6 py-3 font-bold rounded-xl transition-all hover:opacity-90"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--primary)",
                  fontFamily: "var(--font-headline)",
                }}>
                View Career Path
              </button>
            </div>
          </div>

          {/* Resume scan card */}
          <div className="relative z-10 mt-8 lg:mt-0 shrink-0">
            <div className="p-6 rounded-3xl w-60 shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--secondary-fixed, #6ffbbe)" }}>
                  <span className="material-symbols-outlined mat-fill" style={{ color: "var(--primary)", fontSize: 20 }}>
                    description
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-headline)" }}>
                    Resume Scanned
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Status
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Match Accuracy</span>
                  <span className="text-xl font-bold" style={{ color: "var(--secondary-fixed, #6ffbbe)", fontFamily: "var(--font-headline)" }}>
                    98.4%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <div className="h-full rounded-full" style={{ width: "98.4%", background: "var(--secondary-fixed, #6ffbbe)" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 fade-up fade-up-1">
          {FEATURE_CARDS.map(({ icon, iconBg, iconColor, title, desc, cta, ctaColor, href }) => (
            <div key={title}
              className="card-stitch p-8 group cursor-pointer bento-card-hover"
              onClick={() => navigate(href)}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: iconBg }}>
                <span className="material-symbols-outlined mat-fill" style={{ fontSize: 28, color: iconColor }}>
                  {icon}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                {title}
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>{desc}</p>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: ctaColor }}>
                <span>{cta}</span>
                <span className="material-symbols-outlined arrow-slide transition-transform" style={{ fontSize: 18, color: ctaColor }}>
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 fade-up fade-up-2">

          {/* Skill Breakdown */}
          <div className="lg:col-span-5 p-8 rounded-[2rem]" style={{ background: "var(--surface-container)" }}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                  Skill Breakdown
                </h2>
                <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
                  Your expertise vs. {city.name} Market Demand
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "var(--surface-container-highest)", color: "var(--outline)" }}>
                Updated 1h ago
              </span>
            </div>
            <div className="space-y-8 mb-10">
              {SKILLS.map(({ label, pct, isAmber }) => (
                <div key={label} className="space-y-3">
                  <div className="flex justify-between font-bold text-sm" style={{ fontFamily: "var(--font-headline)" }}>
                    <span style={{ color: "var(--on-surface)" }}>{label}</span>
                    <span style={{ color: isAmber ? "#d97706" : "var(--primary)" }}>{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "white" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 999,
                      background: isAmber ? "#f59e0b" : "var(--primary)",
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl flex gap-4 items-start"
              style={{ background: "rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--primary)" }}>
                <span className="material-symbols-outlined text-white mat-fill" style={{ fontSize: 18 }}>lightbulb</span>
              </div>
              <p className="text-sm italic leading-relaxed" style={{ color: "var(--on-surface)" }}>
                Focusing on Kubernetes certifications could increase your match rate by 24% in {city.name}.
              </p>
            </div>
          </div>

          {/* Recent Recommendations */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Recent Recommendations
            </h2>
            <div className="space-y-4 mb-8">
              {JOBS.map(({ co, color, title, meta, match }) => (
                <div key={title}
                  className="card-stitch p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => navigate("/jobs")}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(25,28,30,0.12)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ""}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
                      <span className="text-xl font-black" style={{ color, fontFamily: "var(--font-headline)" }}>{co[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>{title}</h4>
                      <p className="text-sm mt-0.5" style={{ color: "var(--on-surface-variant)" }}>{co} • {meta}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase"
                      style={{ background: "rgba(0,0,0,0.06)", color: "var(--primary)" }}>
                      {match}% Match
                    </span>
                    <button className="p-2 rounded-full transition-colors"
                      style={{ color: "var(--outline)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--primary)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--outline)"}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>bookmark</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/jobs")}
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--primary)", fontFamily: "var(--font-headline)" }}>
              <span>View all job recommendations</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => navigate("/advisor")} className="fab-s fixed bottom-8 right-8 z-50">
        <span className="material-symbols-outlined mat-fill" style={{ fontSize: 24 }}>chat_bubble</span>
      </button>
    </DashboardLayout>
  );
};

export default Dashboard;
