import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import {
  Sparkles, ArrowRight, Upload, TrendingUp, MessageSquare,
  Briefcase, Star, CheckCircle, MapPin, Zap,
  LayoutDashboard, Search, Bell, Target, BookmarkCheck,
  Clock, ChevronRight, Building2, Mic, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import CitySwitcher from "@/components/layout/CitySwitcher";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const FEATURES = [
  { icon: Upload,        title: "AI Resume Analysis",   desc: "Gemini reads your resume and matches you to real ₹LPA jobs in your city",        color: "#22c55e" },
  { icon: TrendingUp,    title: "Skill Gap Analysis",   desc: "See exactly which skills are missing for your target role in the current market", color: "#3b82f6" },
  { icon: MessageSquare, title: "Career Advisor AI",    desc: "Chat with an AI that knows Indian salaries, FAANG prep, and Naukri tactics",      color: "#8b5cf6" },
  { icon: Briefcase,     title: "India-First Job Board", desc: "Live jobs from LinkedIn, Indeed & Naukri with ₹LPA salaries by city",           color: "#f59e0b" },
];

const STATS = [
  { value: "50K+", label: "Jobs listed" },
  { value: "18",   label: "Cities" },
  { value: "95%",  label: "Match accuracy" },
  { value: "3 min",label: "First match" },
];

const TESTIMONIALS = [
  { name: "Priya S.",  role: "SDE-2 at Flipkart",         city: "Bengaluru", text: "Found my dream job in 2 weeks. The AI matched me with roles I'd never have found on Naukri.", avatar: "P", rating: 5 },
  { name: "Rahul M.",  role: "Product Manager at Zomato",  city: "Gurugram",  text: "The skill gap feature showed me exactly what to learn. Got a 40% salary hike.", avatar: "R", rating: 5 },
  { name: "Ananya K.", role: "Data Scientist at TCS",      city: "Hyderabad", text: "The city-specific salary data helped me negotiate ₹18L instead of ₹14L.", avatar: "A", rating: 5 },
];

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Dashboard Mockup (pure HTML/CSS, no images needed) ───────────
const DashboardMockup = () => (
  <div className="w-full rounded-2xl overflow-hidden border border-black/[0.08] shadow-2xl shadow-black/15"
    style={{ background: "#f8f7f4", fontFamily: "'Geist', system-ui" }}>

    {/* Mock topbar */}
    <div className="flex items-center gap-3 px-4 h-10 border-b border-black/[0.06]"
      style={{ background: "rgba(248,247,244,0.95)" }}>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 mx-4">
        <div className="w-48 h-5 rounded-md bg-black/[0.06] flex items-center px-3">
          <span style={{ fontSize: 9, color: "#999" }}>role-match.vercel.app</span>
        </div>
      </div>
    </div>

    <div className="flex" style={{ height: 420 }}>
      {/* Mock sidebar */}
      <div className="flex flex-col items-center py-3 gap-2 border-r border-black/[0.06]"
        style={{ width: 48, background: "#0a0a0a" }}>
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center mb-1">
          <Sparkles style={{ width: 14, height: 14, color: "white" }} />
        </div>
        {[LayoutDashboard, Briefcase, Upload, TrendingUp, MessageSquare, Mic, FileText, Building2].map((Icon, i) => (
          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-emerald-500/15" : ""}`}>
            <Icon style={{ width: 14, height: 14, color: i === 0 ? "#22c55e" : "rgba(255,255,255,0.35)" }} />
          </div>
        ))}
      </div>

      {/* Mock content */}
      <div className="flex-1 overflow-hidden">
        {/* Mock header */}
        <div className="flex items-center px-4 h-9 border-b border-black/[0.05] gap-3"
          style={{ background: "rgba(248,247,244,0.9)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#333" }}>Dashboard</span>
          <div className="flex-1" />
          <div className="w-28 h-5 rounded-md bg-black/[0.05] flex items-center px-2 gap-1.5">
            <Search style={{ width: 9, height: 9, color: "#aaa" }} />
            <span style={{ fontSize: 9, color: "#bbb" }}>Search...</span>
          </div>
          <div className="w-20 h-5 rounded-full border border-black/10 flex items-center px-2 gap-1">
            <MapPin style={{ width: 9, height: 9, color: "#22c55e" }} />
            <span style={{ fontSize: 9, color: "#555" }}>Bengaluru</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>C</span>
          </div>
        </div>

        {/* Mock body */}
        <div className="p-4 space-y-3"
          style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>

          {/* Greeting */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Good morning, Chaitanya 👋</div>
            <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>Showing opportunities in <span style={{ color: "#22c55e", fontWeight: 600 }}>Bengaluru</span></div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total Matches", value: "61", trend: "+18", accent: "#22c55e" },
              { label: "Saved Jobs",    value: "12", trend: "+3",  accent: "#3b82f6" },
              { label: "Profile Score", value: "78%",trend: "↑5%", accent: "#f59e0b" },
              { label: "Applications", value: "5",  trend: "2 active",accent: "#ef4444" },
            ].map(({ label, value, trend, accent }) => (
              <div key={label} className="rounded-xl p-2.5"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", borderLeft: `3px solid ${accent}` }}>
                <div style={{ fontSize: 8, color: "#999", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 8, color: accent, marginTop: 3, fontWeight: 600 }}>{trend}</div>
              </div>
            ))}
          </div>

          {/* Chart + skills row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Area chart mockup */}
            <div className="col-span-2 rounded-xl p-3"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#111", marginBottom: 8 }}>Match Activity</div>
              <svg viewBox="0 0 200 60" style={{ width: "100%", height: 60 }}>
                <defs>
                  <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,50 L28,42 L56,46 L84,28 L112,34 L140,18 L168,22 L200,8" fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d="M0,50 L28,42 L56,46 L84,28 L112,34 L140,18 L168,22 L200,8 L200,60 L0,60 Z" fill="url(#mg)" />
                {[0,28,56,84,112,140,168,200].map((x, i) => (
                  <text key={i} x={x === 200 ? 196 : x} y={58} fontSize="6" fill="#bbb" textAnchor="middle">W{i+1}</text>
                ))}
              </svg>
            </div>

            {/* Skills */}
            <div className="rounded-xl p-3"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#111", marginBottom: 8 }}>Top Skills</div>
              {[["React", 94], ["TypeScript", 87], ["Node.js", 79], ["Python", 73]].map(([s, v]) => (
                <div key={s} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#555", marginBottom: 2 }}>
                    <span>{s}</span><span style={{ color: "#22c55e" }}>{v}%</span>
                  </div>
                  <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${v}%`, background: "#22c55e", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent matches */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#111" }}>Recent Matches</span>
              <span style={{ fontSize: 8, color: "#22c55e", fontWeight: 600 }}>View all →</span>
            </div>
            {[
              { t: "Senior Frontend Engineer", c: "Swiggy",   s: 94, type: "Remote" },
              { t: "Full Stack Developer",     c: "Razorpay", s: 87, type: "Hybrid" },
              { t: "React Developer",          c: "PhonePe",  s: 82, type: "On-site" },
            ].map(({ t, c, s, type }) => (
              <div key={t} style={{ padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#555", flexShrink: 0 }}>
                  {c[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</div>
                  <div style={{ fontSize: 8, color: "#22c55e", fontWeight: 500 }}>{c} · {type}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#22c55e", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 999, padding: "1px 6px" }}>{s}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Auth Modal ───────────────────────────────────────────────────
const AuthModal = ({ open, onClose, defaultTab = "login" }: { open: boolean; onClose: () => void; defaultTab?: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "", confirm: "" });

  const errMap: Record<string, string> = {
    "auth/user-not-found": "No account with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "Email already registered.",
    "auth/weak-password": "Password must be 6+ characters.",
    "auth/popup-closed-by-user": "",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, login.email, login.password);
      onClose(); navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: errMap[err.code] || err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signup.password !== signup.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, signup.email, signup.password);
      await updateProfile(user, { displayName: signup.name });
      await sendEmailVerification(user);
      toast({ title: "Account created!", description: "Check your email to verify." });
      setTab("login");
    } catch (err: any) {
      toast({ title: "Sign up failed", description: errMap[err.code] || err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose(); navigate("/dashboard");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user")
        toast({ title: "Google sign-in failed", description: errMap[err.code] || err.message, variant: "destructive" });
    } finally { setGLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">RoleMatch</span>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-5"><TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger><TabsTrigger value="signup" className="flex-1">Create Account</TabsTrigger></TabsList>
            <Button variant="outline" className="w-full gap-2.5 mb-4 h-10" onClick={handleGoogle} disabled={gLoading} type="button">
              {gLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              <span className="text-sm font-medium">Continue with Google</span>
            </Button>
            <div className="relative mb-4"><Separator /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span></div>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1"><Label className="text-xs font-medium">Email</Label><Input type="email" placeholder="you@example.com" className="h-10" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required /></div>
                <div className="space-y-1"><Label className="text-xs font-medium">Password</Label>
                  <div className="relative"><Input type={showPw ? "text" : "password"} placeholder="••••••••" className="h-10 pr-10" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1"><Label className="text-xs font-medium">Full Name</Label><Input placeholder="Chaitanya Sai" className="h-10" value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} required /></div>
                <div className="space-y-1"><Label className="text-xs font-medium">Email</Label><Input type="email" placeholder="you@example.com" className="h-10" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs font-medium">Password</Label><div className="relative"><Input type={showPw ? "text" : "password"} placeholder="Min 6" className="h-10 pr-8" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div></div>
                  <div className="space-y-1"><Label className="text-xs font-medium">Confirm</Label><Input type={showPw ? "text" : "password"} placeholder="Repeat" className="h-10" value={signup.confirm} onChange={(e) => setSignup({ ...signup, confirm: e.target.value })} required /></div>
                </div>
                <Button type="submit" className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Account"}</Button>
                <p className="text-xs text-center text-muted-foreground">By signing up you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a></p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Landing Page ─────────────────────────────────────────────────
const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { city } = useCity();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const openAuth = (tab: string) => { setAuthTab(tab); setAuthOpen(true); };
  if (user) { navigate("/dashboard"); return null; }

  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4" }}>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: "rgba(248,247,244,0.92)", borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">RoleMatch</span>
          </div>
          <div className="flex items-center gap-2">
            <CitySwitcher variant="navbar" />
            <Button variant="ghost" size="sm" className="text-sm" onClick={() => openAuth("login")}>Sign in</Button>
            <Button size="sm" className="bg-black hover:bg-black/80 text-white text-sm h-8 px-4 rounded-lg"
              onClick={() => openAuth("signup")}>
              Get started <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-10 px-5 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-3.5 py-1.5 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">India's first AI-powered career platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-black leading-[1.05] mb-6">
            Find your perfect
            <span className="block text-emerald-500">role in {city.name}</span>
          </h1>

          <p className="text-lg text-black/45 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your resume. Gemini AI analyzes your skills and matches you to real jobs with ₹LPA salaries — in {city.name} and across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button size="lg" className="bg-black hover:bg-black/80 text-white h-12 px-8 text-base font-semibold rounded-xl shadow-lg"
              onClick={() => openAuth("signup")}>
              Start for free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-xl border-black/15 bg-white hover:bg-muted/40"
              onClick={() => openAuth("login")}>
              Sign in
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-sm text-black/35">
            <MapPin className="h-3.5 w-3.5" />
            <span>Showing jobs for</span>
            <CitySwitcher variant="navbar" />
          </div>
        </div>
      </section>

      {/* ── Dashboard Mockup ── */}
      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <div className="relative">
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
            style={{ background: "linear-gradient(135deg, #22c55e20, #3b82f620)" }} />
          <div className="relative">
            <DashboardMockup />
          </div>
        </div>
        <p className="text-center text-xs text-black/30 mt-4 font-medium">
          Your dashboard — personalized with real data after you upload your resume
        </p>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-white" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-8 text-center">
              <div className="text-3xl font-black text-black tracking-tight">{value}</div>
              <div className="text-sm text-black/35 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-black tracking-tight mb-3">Everything to land your next role</h2>
          <p className="text-black/35 text-lg max-w-md mx-auto">Powered by Google Gemini + Groq — built for India</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border hover:shadow-md transition-all group cursor-default"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${color}15` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-base text-black mb-2">{title}</h3>
              <p className="text-sm text-black/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-white border-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl font-black text-center text-black mb-10 tracking-tight">Loved by job seekers across India</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, city: c, text, avatar, rating }) => (
              <div key={name} className="rounded-2xl p-5 border" style={{ background: "#f8f7f4", borderColor: "rgba(0,0,0,0.06)" }}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-black/55 leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-black">{name}</p>
                    <p className="text-xs text-black/35">{role} · {c}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 max-w-2xl mx-auto px-5 text-center">
        <h2 className="text-3xl font-black text-black tracking-tight mb-4">Ready to find your next role?</h2>
        <p className="text-black/35 mb-8 text-lg">Join thousands in {city.name} finding better jobs with AI.</p>
        <Button size="lg" className="bg-black hover:bg-black/80 text-white h-12 px-10 text-base font-semibold rounded-xl shadow-lg gap-2"
          onClick={() => openAuth("signup")}>
          <Sparkles className="h-5 w-5 text-emerald-400" />Get Started Free
        </Button>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-black/25">
          {["No credit card", "Free forever", "18 Indian cities"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{t}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-black/25" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        © {new Date().getFullYear()} RoleMatch · Built for India · Made by Chaitanysai
      </footer>
    </div>
  );
};

export default Landing;
