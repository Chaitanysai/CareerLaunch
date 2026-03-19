import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import {
  Sparkles, ArrowRight, Upload, TrendingUp, MessageSquare,
  Briefcase, Star, CheckCircle, MapPin, ChevronRight,
  Zap, Shield, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CitySwitcher from "@/components/layout/CitySwitcher";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const FEATURES = [
  { icon: Upload,       title: "AI Resume Analysis",   desc: "Gemini AI reads your resume and extracts skills, seniority, and matches you to real ₹LPA jobs", color: "#22c55e" },
  { icon: TrendingUp,   title: "Skill Gap Analysis",   desc: "See exactly which skills are missing for your target role in your city's current job market",    color: "#3b82f6" },
  { icon: MessageSquare,title: "Career Advisor AI",    desc: "Chat with an AI that knows Indian salaries in LPA, FAANG interview prep, and Naukri tips",        color: "#8b5cf6" },
  { icon: Briefcase,    title: "India-First Job Board", desc: "Live jobs from LinkedIn, Indeed & Naukri with ₹LPA salaries, filtered by your city",             color: "#f59e0b" },
];

const STATS = [
  { value: "50K+", label: "Jobs listed" },
  { value: "18", label: "Cities" },
  { value: "95%", label: "Match accuracy" },
  { value: "3 min", label: "First match" },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "SDE-2 at Flipkart", city: "Bengaluru", text: "Found my dream job in 2 weeks. The AI matched me with roles I'd never have found on Naukri.", avatar: "P", rating: 5 },
  { name: "Rahul M.", role: "Product Manager at Zomato", city: "Gurugram", text: "The skill gap feature showed me exactly what to learn. Got a 40% salary hike.", avatar: "R", rating: 5 },
  { name: "Ananya K.", role: "Data Scientist at TCS", city: "Hyderabad", text: "The city-specific salary data helped me negotiate ₹18L instead of ₹14L.", avatar: "A", rating: 5 },
];

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Auth Modal ──────────────────────────────────────────────────
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
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">RoleMatch</span>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-5 bg-muted/60">
              <TabsTrigger value="login" className="flex-1 text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 text-sm">Create Account</TabsTrigger>
            </TabsList>

            <Button variant="outline" className="w-full gap-2.5 mb-4 h-10 border-border/60 hover:bg-muted/50"
              onClick={handleGoogle} disabled={gLoading} type="button">
              {gLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              <span className="text-sm font-medium">Continue with Google</span>
            </Button>

            <div className="relative mb-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input type="email" placeholder="you@example.com" className="h-10"
                    value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Password</Label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} placeholder="••••••••" className="h-10 pr-10"
                      value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Full Name</Label>
                  <Input placeholder="Chaitanya Sai" className="h-10"
                    value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input type="email" placeholder="you@example.com" className="h-10"
                    value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Password</Label>
                    <div className="relative">
                      <Input type={showPw ? "text" : "password"} placeholder="Min 6 chars" className="h-10 pr-9"
                        value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required />
                      <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Confirm</Label>
                    <Input type={showPw ? "text" : "password"} placeholder="Repeat" className="h-10"
                      value={signup.confirm} onChange={(e) => setSignup({ ...signup, confirm: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Account"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By signing up you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy Policy</a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Landing Page ────────────────────────────────────────────────
const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { city } = useCity();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  const openAuth = (tab: string) => { setAuthTab(tab); setAuthOpen(true); };
  if (user) { navigate("/dashboard"); return null; }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-[#f8f7f4]/90 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">RoleMatch</span>
          </div>
          <div className="flex items-center gap-2">
            <CitySwitcher variant="navbar" />
            <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => openAuth("login")}>
              Sign in
            </Button>
            <Button size="sm" className="bg-black hover:bg-black/80 text-white text-sm font-medium h-8 px-4"
              onClick={() => openAuth("signup")}>
              Get started <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-5 overflow-hidden">
        {/* Clerk-style dotted grid */}
        <div className="absolute inset-0 dot-grid opacity-60" />
        {/* Subtle green glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-3.5 py-1.5 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">India's first AI-powered career platform</span>
          </div>

          {/* Clerk-style large bold heading */}
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-black leading-[1.05] mb-6 text-balance">
            Find your perfect
            <span className="block text-emerald-500">role in {city.name}</span>
          </h1>

          <p className="text-lg text-black/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your resume. Gemini AI analyzes your skills and matches you to real jobs with ₹LPA salaries — in {city.name} and across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg"
              className="bg-black hover:bg-black/80 text-white h-12 px-8 text-base font-semibold rounded-xl shadow-lg"
              onClick={() => openAuth("signup")}>
              Start for free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline"
              className="h-12 px-8 text-base border-black/15 bg-white hover:bg-muted/50 rounded-xl"
              onClick={() => openAuth("login")}>
              Sign in
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-8 text-sm text-black/40">
            <MapPin className="h-3.5 w-3.5" />
            <span>Currently showing jobs for</span>
            <CitySwitcher variant="navbar" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-black/[0.06] bg-white">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-black/[0.06]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-8 text-center">
              <div className="text-3xl font-black text-black tracking-tight">{value}</div>
              <div className="text-sm text-black/40 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features bento ── */}
      <section className="py-20 max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-black tracking-tight mb-3">Everything you need to land your next role</h2>
          <p className="text-black/40 text-lg max-w-md mx-auto">Powered by Google Gemini + Groq — built for the Indian job market</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md transition-all group cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${color}18` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-base text-black mb-2">{title}</h3>
              <p className="text-sm text-black/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl font-black text-center text-black mb-10 tracking-tight">
            Loved by job seekers across India
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, city: c, text, avatar, rating }) => (
              <div key={name} className="bg-[#f8f7f4] rounded-2xl p-5 border border-black/[0.06]">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-black/60 leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{name}</p>
                    <p className="text-xs text-black/40">{role} · {c}</p>
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
        <p className="text-black/40 mb-8 text-lg">Join thousands of professionals finding better jobs in {city.name}.</p>
        <Button size="lg"
          className="bg-black hover:bg-black/80 text-white h-12 px-10 text-base font-semibold rounded-xl shadow-lg gap-2"
          onClick={() => openAuth("signup")}>
          <Sparkles className="h-5 w-5 text-emerald-400" />
          Get Started Free
        </Button>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-black/30">
          {["No credit card", "Free forever plan", "18 Indian cities"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-6 text-center text-xs text-black/30">
        © {new Date().getFullYear()} RoleMatch · Built for India · Made by Chaitanysai
      </footer>
    </div>
  );
};

export default Landing;
