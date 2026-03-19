import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles, ArrowRight, Briefcase, TrendingUp,
  MessageSquare, Upload, Star, CheckCircle, MapPin, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CitySwitcher from "@/components/layout/CitySwitcher";
import { useCity } from "@/hooks/useCity";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const FEATURES = [
  { icon: Upload, title: "AI Resume Analysis", desc: "Gemini AI extracts skills, experience and matches you to real jobs in your city", color: "text-blue-500" },
  { icon: TrendingUp, title: "Skill Gap Analysis", desc: "See exactly what skills are missing for your target role in your city's market", color: "text-emerald-500" },
  { icon: MessageSquare, title: "Career Advisor AI", desc: "Chat with an AI that knows the Indian job market, salaries in LPA, and top companies", color: "text-purple-500" },
  { icon: Briefcase, title: "India-First Job Board", desc: "Jobs filtered by city with ₹LPA salaries, WFH options and tier-1 city insights", color: "text-orange-500" },
];

const STATS = [
  { value: "50K+", label: "Jobs listed" },
  { value: "18", label: "Cities covered" },
  { value: "95%", label: "Match accuracy" },
  { value: "3 min", label: "To first match" },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "SDE-2 at Flipkart", city: "Bengaluru", text: "Found my dream job in 2 weeks. The AI matched me with roles I'd never have found on Naukri.", avatar: "P" },
  { name: "Rahul M.", role: "Product Manager at Zomato", city: "Gurugram", text: "The skill gap feature showed me exactly what to learn. Got a 40% salary hike.", avatar: "R" },
  { name: "Ananya K.", role: "Data Scientist at TCS", city: "Hyderabad", text: "The city-specific salary data helped me negotiate ₹18L instead of ₹14L.", avatar: "A" },
];

// ── Auth Modal ───────────────────────────────────────────────────
const AuthModal = ({ open, onClose, defaultTab = "login" }: {
  open: boolean; onClose: () => void; defaultTab?: string;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "", confirm: "" });

  const errMsg: Record<string, string> = {
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
      toast({ title: "Sign in failed", description: errMsg[err.code] || err.message, variant: "destructive" });
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
      toast({ title: "Sign up failed", description: errMsg[err.code] || err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose(); navigate("/dashboard");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user")
        toast({ title: "Google sign-in failed", description: errMsg[err.code] || err.message, variant: "destructive" });
    } finally { setGoogleLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">Role<span className="text-accent">Match</span></span>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Create Account</TabsTrigger>
            </TabsList>

            <Button variant="outline" className="w-full gap-2 mb-4" onClick={handleGoogle} disabled={googleLoading} type="button">
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative mb-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={login.email}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} placeholder="••••••••" className="pr-9"
                      value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input placeholder="Chaitanya Sai" value={signup.name}
                    onChange={(e) => setSignup({ ...signup, name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={signup.email}
                    onChange={(e) => setSignup({ ...signup, email: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} placeholder="Min 6 characters" className="pr-9"
                      value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <Input type={showPw ? "text" : "password"} placeholder="Repeat password"
                    value={signup.confirm} onChange={(e) => setSignup({ ...signup, confirm: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Account"}
                </Button>
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
    <div className="min-h-screen bg-background">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md"
        style={{ background: "rgba(6,13,31,0.95)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-500)" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-white">
              Role<span style={{ color: "var(--accent-500)" }}>Match</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CitySwitcher variant="landing" />
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => openAuth("login")}>Sign In</Button>
            <Button className="text-white font-medium"
              style={{ background: "var(--accent-500)" }}
              onClick={() => openAuth("signup")}>
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "48px 48px" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm font-medium border"
            style={{ background: "rgba(0,200,150,0.15)", color: "var(--accent-500)", borderColor: "rgba(0,200,150,0.3)" }}>
            India's first AI-powered career platform
          </Badge>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Find Jobs That Match
            <span className="block" style={{ color: "var(--accent-500)" }}>Your Skills in {city.name}</span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume. Let AI analyze your skills and match you with the best opportunities
            in {city.name} — with real salaries in ₹LPA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gap-2 h-12 px-8 text-base font-semibold text-white"
              style={{ background: "var(--accent-500)" }}
              onClick={() => openAuth("signup")}>
              Start for Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline"
              className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10"
              onClick={() => openAuth("login")}>
              Sign In
            </Button>
          </div>

          {/* City switcher in hero */}
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>Showing jobs for</span>
            <CitySwitcher variant="landing" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/50">
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-8 px-6 text-center">
              <div className="font-heading text-3xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
            Everything you need to land your dream job
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powered by Google Gemini AI and Groq — built specifically for the Indian job market
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-card border border-border/50 rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all group">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-center text-foreground mb-10">
            Loved by job seekers across India
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, city: c, text, avatar }) => (
              <div key={name} className="bg-card border border-border/50 rounded-xl p-5 card-shadow">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role} · {c}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
          Ready to find your next role?
        </h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of professionals finding better jobs in {city.name} and across India.
        </p>
        <Button size="lg" className="gap-2 h-12 px-10 text-base font-semibold text-white"
          style={{ background: "var(--sidebar-bg)" }}
          onClick={() => openAuth("signup")}>
          <Sparkles className="h-5 w-5" style={{ color: "var(--accent-500)" }} />
          Get Started Free
        </Button>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
          {["No credit card required", "Free forever plan", "18 Indian cities"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-accent" />{t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} RoleMatch · Built for India · Made by Chaitanysai</p>
      </footer>
    </div>
  );
};

export default Landing;
