import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useCity } from "@/hooks/useCity";
import {
  Upload, Sparkles, ArrowRight, ArrowUpRight,
  Briefcase, BookmarkCheck, TrendingUp, Target,
  ChevronRight, Clock, Zap, FileText, MessageSquare,
  Map, Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Empty state hero ─────────────────────────────────────────────
const EmptyDashboard = () => {
  const { user } = useAuth();
  const { city } = useCity();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { icon: Upload,       label: "Analyze Resume",   sub: "Get AI job matches",           href: "/match",           color: "#22c55e", bg: "#f0fdf4" },
    { icon: Briefcase,    label: "Browse Jobs",       sub: `Live jobs in ${city.name}`,    href: "/jobs",            color: "#3b82f6", bg: "#eff6ff" },
    { icon: Mic,          label: "Interview Prep",    sub: "Practice mock interviews",     href: "/interview",       color: "#8b5cf6", bg: "#f5f3ff" },
    { icon: TrendingUp,   label: "Skill Gap",         sub: "Find your missing skills",     href: "/skillgap",        color: "#f59e0b", bg: "#fffbeb" },
    { icon: Map,          label: "Career Roadmap",    sub: "Plan your path forward",       href: "/career-roadmap",  color: "#06b6d4", bg: "#ecfeff" },
    { icon: MessageSquare,label: "AI Advisor",        sub: "Chat about your career",       href: "/advisor",         color: "#ec4899", bg: "#fdf2f8" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 space-y-10">

      {/* Greeting */}
      <div className="text-center fade-up">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-black tracking-tight mb-2">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-black/50 text-base max-w-sm mx-auto leading-relaxed">
          Welcome to RoleMatch. Start by uploading your resume to get AI-powered job matches in <span className="text-emerald-600 font-medium">{city.name}</span>.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="fade-up fade-up-1">
        <div className="card-premium p-6 text-center"
          style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0f2040 100%)", border: "none" }}>
          <p className="font-semibold text-white mb-1">Start with your resume</p>
          <p className="text-white/40 text-sm mb-4">Upload PDF, DOC, or TXT — Gemini AI does the rest</p>
          <Button
            onClick={() => navigate("/match")}
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 h-11 px-8"
          >
            <Upload className="h-4 w-4" />
            Analyze My Resume
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick actions grid */}
      <div className="fade-up fade-up-2">
        <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-3">Or explore features</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map(({ icon: Icon, label, sub, href, color, bg }) => (
            <button key={href} onClick={() => navigate(href)}
              className="card-premium p-4 text-left group hover:-translate-y-0.5 active:translate-y-0 transition-all">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ background: bg }}>
                <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18, color }} />
              </div>
              <p className="font-semibold text-sm text-black">{label}</p>
              <p className="text-xs text-black/40 mt-0.5 leading-tight">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips row */}
      <div className="fade-up fade-up-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { emoji: "🎯", tip: "Upload your resume to unlock AI job matching" },
          { emoji: "📍", tip: "Switch cities using the city picker in the top bar" },
          { emoji: "💬", tip: "Ask the AI Advisor anything about your career" },
        ].map(({ emoji, tip }) => (
          <div key={tip} className="flex items-start gap-3 p-3.5 rounded-xl"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="text-lg shrink-0">{emoji}</span>
            <p className="text-xs text-black/50 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Dashboard with data (after resume analyzed) ──────────────────
// This would normally come from Firestore/state — for now shown after resume upload
const Dashboard = () => {
  // In a real app you'd check if user has any saved data from Firestore
  // For now always show empty state — data appears after they use the app
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <EmptyDashboard />
    </div>
  );
};

export default Dashboard;
