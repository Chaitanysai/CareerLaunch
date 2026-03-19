import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useCity } from "@/hooks/useCity";
import {
  Briefcase, BookmarkCheck, TrendingUp, Target,
  ArrowRight, Upload, Sparkles, Clock, ArrowUpRight,
  Zap, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, ResponsiveContainer } from "recharts";

const matchData = [
  { week: "W1", matches: 4 }, { week: "W2", matches: 8 },
  { week: "W3", matches: 6 }, { week: "W4", matches: 14 },
  { week: "W5", matches: 11 },{ week: "W6", matches: 18 },
  { week: "W7", matches: 22 },
];

const skillData = [
  { skill: "React", demand: 94, color: "#22c55e" },
  { skill: "TypeScript", demand: 87, color: "#22c55e" },
  { skill: "Node.js", demand: 79, color: "#22c55e" },
  { skill: "Python", demand: 73, color: "#f59e0b" },
  { skill: "AWS", demand: 66, color: "#f59e0b" },
];

const recentJobs = [
  { title: "Senior Frontend Engineer", company: "Swiggy", match: 94, type: "Remote", posted: "2h", logo: "S" },
  { title: "Full Stack Developer",     company: "Razorpay", match: 87, type: "Hybrid", posted: "5h", logo: "R" },
  { title: "React Developer",          company: "PhonePe", match: 82, type: "On-site", posted: "1d", logo: "P" },
  { title: "Software Engineer II",     company: "CRED",    match: 78, type: "Remote",  posted: "1d", logo: "C" },
];

const chartConfig = { matches: { label: "Matches", color: "#22c55e" } };

const Dashboard = () => {
  const { user } = useAuth();
  const { city } = useCity();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Total Matches",  value: "61",  sub: "+18 this week",  accent: "stat-accent-green", icon: Target,       trend: "+42%" },
    { label: "Saved Jobs",     value: "12",  sub: "3 new added",    accent: "stat-accent-blue",  icon: BookmarkCheck, trend: "+3" },
    { label: "Profile Score",  value: "78%", sub: "+5% this month", accent: "stat-accent-amber", icon: TrendingUp,    trend: "↑" },
    { label: "Applications",   value: "5",   sub: "2 in review",    accent: "stat-accent-red",   icon: Briefcase,     trend: "Active" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-7 py-7 space-y-6">

      {/* Greeting header — Finexy style */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 fade-up">
        <div>
          <p className="text-sm text-muted-foreground mb-0.5">{greeting},</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {firstName} <span className="text-muted-foreground/40">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay on top of your job search · <span className="text-emerald-600 font-medium">{city.name}</span>
          </p>
        </div>
        <Button onClick={() => navigate("/match")}
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white self-start sm:self-auto shadow-sm">
          <Upload className="h-4 w-4" />Analyze Resume
        </Button>
      </div>

      {/* ── Stats row — bento style ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, accent, icon: Icon, trend }, i) => (
          <div key={label}
            className={`card-premium p-4 ${accent} fade-up fade-up-${i + 1}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                {trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main bento grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Match activity chart — 2 cols */}
        <div className="lg:col-span-2 card-premium p-5 fade-up fade-up-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-foreground">Match Activity</p>
              <p className="text-xs text-muted-foreground mt-0.5">Job matches over 7 weeks</p>
            </div>
            <span className="badge-green">
              <Zap className="h-3 w-3" />+18 this week
            </span>
          </div>
          <ChartContainer config={chartConfig} className="h-44">
            <AreaChart data={matchData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="matches" stroke="#22c55e" fill="url(#g1)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Skill demand — 1 col */}
        <div className="card-premium p-5 fade-up fade-up-3">
          <div className="mb-4">
            <p className="font-semibold text-sm text-foreground">Skills in Demand</p>
            <p className="text-xs text-muted-foreground mt-0.5">{city.name} market</p>
          </div>
          <div className="space-y-3">
            {skillData.map(({ skill, demand, color }) => (
              <div key={skill}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{skill}</span>
                  <span className="text-muted-foreground">{demand}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${demand}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent matches ── */}
      <div className="card-premium fade-up fade-up-4">
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "hsl(var(--border))" }}>
          <div>
            <p className="font-semibold text-sm text-foreground">Recent Matches</p>
            <p className="text-xs text-muted-foreground mt-0.5">Top jobs for your profile in {city.name}</p>
          </div>
          <button onClick={() => navigate("/jobs")}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
          {recentJobs.map((job) => (
            <div key={job.title}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
              onClick={() => navigate("/jobs")}>
              {/* Company logo */}
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                {job.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-emerald-600 font-medium">{job.company}</span>
                  <span className="text-xs text-muted-foreground">{job.type}</span>
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />{job.posted} ago
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {job.match}%
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA banner ── */}
      <div className="card-premium overflow-hidden fade-up fade-up-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5"
          style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0f2040 100%)" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Get AI-powered matches</p>
              <p className="text-white/50 text-xs mt-0.5">Upload your resume for Gemini AI analysis in {city.name}</p>
            </div>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-white shrink-0 shadow-lg"
            onClick={() => navigate("/match")}>
            Analyze Resume
            <ArrowUpRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
