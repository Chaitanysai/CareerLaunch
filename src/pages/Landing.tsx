import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import CitySwitcher from "@/components/layout/CitySwitcher";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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

  const inputStyle = {
    background: "var(--surface-container-high)", border: "none", outline: "none",
    borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem",
    color: "var(--on-surface)", width: "100%", transition: "box-shadow 0.15s",
    fontFamily: "var(--font-body)",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden shadow-2xl border-0">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "var(--primary)" }}>
              <span className="material-symbols-outlined text-white mat-fill" style={{ fontSize: 16 }}>psychology</span>
            </div>
            <span className="font-bold text-base tracking-tight" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              RoleMatch
            </span>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-5">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Create Account</TabsTrigger>
            </TabsList>

            <button
              className="w-full flex items-center justify-center gap-2.5 h-11 mb-4 rounded-xl font-medium text-sm border transition-colors"
              style={{ background: "white", borderColor: "var(--outline-variant)", color: "var(--on-surface)" }}
              onClick={handleGoogle} disabled={gLoading}>
              {gLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>

            <div className="relative mb-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs"
                style={{ background: "white", color: "var(--on-surface-variant)" }}>or</span>
            </div>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--on-surface-variant)" }}>Email</label>
                  <input type="email" style={inputStyle} placeholder="you@example.com"
                    value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })}
                    onFocus={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.25)"}
                    onBlur={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--on-surface-variant)" }}>Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} style={{ ...inputStyle, paddingRight: "2.5rem" }}
                      placeholder="••••••••"
                      value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })}
                      onFocus={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.25)"}
                      onBlur={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--on-surface-variant)" }} onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary-s w-full justify-center py-3" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                {[
                  { label: "Full Name", key: "name", type: "text", ph: "Chaitanya Sai" },
                  { label: "Email", key: "email", type: "email", ph: "you@example.com" },
                ].map(({ label, key, type, ph }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--on-surface-variant)" }}>{label}</label>
                    <input type={type} style={inputStyle} placeholder={ph}
                      value={(signup as any)[key]} onChange={e => setSignup({ ...signup, [key]: e.target.value })}
                      onFocus={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.25)"}
                      onBlur={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"} required />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Password", key: "password", ph: "Min 6" },
                    { label: "Confirm", key: "confirm", ph: "Repeat" },
                  ].map(({ label, key, ph }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--on-surface-variant)" }}>{label}</label>
                      <input type={showPw ? "text" : "password"} style={inputStyle} placeholder={ph}
                        value={(signup as any)[key]} onChange={e => setSignup({ ...signup, [key]: e.target.value })}
                        onFocus={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0,79,52,0.25)"}
                        onBlur={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"} required />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-primary-s w-full justify-center py-3" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Account"}
                </button>
                <p className="text-xs text-center" style={{ color: "var(--on-surface-variant)" }}>
                  By signing up you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FEATURES = [
  { icon: "description",    title: "AI Resume",    desc: "Generate ATS-proof resumes that highlight your specific impact in the Indian tech ecosystem.",     bg: "rgba(0,79,52,0.08)",   color: "var(--primary)" },
  { icon: "monitoring",     title: "Skill Gap",    desc: "Real-time analysis of market demand vs your profile. Know exactly what to learn next.",             bg: "rgba(0,108,74,0.12)",  color: "var(--secondary)" },
  { icon: "psychology",     title: "Advisor",      desc: "A virtual mentor for negotiation and career transitions with data-backed insights.",                 bg: "rgba(0,79,52,0.08)",   color: "var(--primary)" },
  { icon: "work",           title: "Job Board",    desc: "Curated high-LPA roles from top unicorns and product firms across Hyderabad, Bengaluru and beyond.", bg: "rgba(0,108,74,0.12)",  color: "var(--secondary)" },
];

const TESTIMONIALS = [
  { name: "Arjun Reddy",  role: "Senior SDE @ Unicorn",    city: "Hyderabad", text: "RoleMatch helped me pivot from a service firm to a top product startup in Gachibowli with a 60% hike. The skill gap analysis was a game changer.", init: "A" },
  { name: "Priya Sharma", role: "Product Lead @ Fintech",  city: "Bengaluru", text: "The editorial feel of the platform makes job hunting feel less like a chore and more like a curated experience for your career.", init: "P" },
  { name: "Karthik V.",   role: "Backend Architect",       city: "Chennai",   text: "Finding roles in Hyderabad that match global standards was hard until I tried RoleMatch. Highly recommend for serious tech professionals.", init: "K" },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { city } = useCity();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [counter, setCounter] = useState({ jobs: 0, cities: 0, accuracy: 0 });

  useEffect(() => {
    if (user) { navigate("/dashboard"); return; }
    // Animate counters
    const targets = { jobs: 50, cities: 18, accuracy: 95 };
    const dur = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const prog = step / steps;
      setCounter({
        jobs: Math.round(targets.jobs * prog),
        cities: Math.round(targets.cities * prog),
        accuracy: Math.round(targets.accuracy * prog),
      });
      if (step >= steps) clearInterval(timer);
    }, dur / steps);
    return () => clearInterval(timer);
  }, [user]);

  const openAuth = (tab: string) => { setAuthTab(tab); setAuthOpen(true); };

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {/* Navbar — from Stitch */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-20"
        style={{ background: "rgba(247,249,251,0.85)", backdropFilter: "blur(32px)", boxShadow: "0 4px 24px var(--primary)08" }}>
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tighter" style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
            RoleMatch
          </span>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors"
            style={{ background: "var(--surface-container)", color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
            <CitySwitcher variant="navbar" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-5 py-2 font-semibold rounded-xl transition-colors"
            style={{ color: "var(--primary)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,79,52,0.05)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            onClick={() => openAuth("login")}>
            Sign in
          </button>
          <button className="px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-all"
            style={{ background: "var(--on-surface)", color: "var(--surface-container-lowest)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            onClick={() => openAuth("signup")}>
            Get started
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero — from Stitch with dot grid + floating browser */}
        <section className="relative min-h-[840px] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(var(--outline-variant) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}>
          <div className="max-w-4xl mx-auto z-10 py-20">
            <h1 className="font-bold text-5xl md:text-7xl tracking-tight mb-8 leading-[1.1] fade-up"
              style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Find your perfect role in{" "}
              <span style={{ color: "var(--primary)" }}>{city.name}</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 fade-up fade-up-1"
              style={{ color: "var(--on-surface-variant)" }}>
              Experience the next generation of career matching. AI-driven job discovery tailored for India's premium tech landscape.
            </p>

            {/* Stats — animated counters from Stitch */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 fade-up fade-up-2">
              {[
                { value: `${counter.jobs}K+`, label: "Jobs" },
                { value: `${counter.cities}`, label: "Cities" },
                { value: `${counter.accuracy}%`, label: "Accuracy" },
              ].map(({ value, label }) => (
                <div key={label} className="px-6 py-3 rounded-full flex items-center gap-3 shadow-sm"
                  style={{ background: "var(--surface-container-lowest)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--secondary)" }} />
                  <span className="font-bold" style={{ color: "var(--on-surface)" }}>
                    {value} {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 fade-up fade-up-3">
              <button className="px-10 py-4 font-bold rounded-xl text-lg flex items-center gap-2 transition-all"
                style={{ background: "var(--on-surface)", color: "var(--surface-container-lowest)" }}
                onClick={() => openAuth("signup")}>
                Get started
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </button>
              <button className="px-8 py-4 font-bold rounded-xl text-lg transition-colors"
                style={{ color: "var(--primary)", border: "2px solid rgba(0,79,52,0.2)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,79,52,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                onClick={() => openAuth("login")}>
                Sign in
              </button>
            </div>
          </div>

          {/* Browser mockup — from Stitch, floating animation */}
          <div className="relative w-full max-w-5xl mx-auto px-4 translate-y-4 animate-float fade-up fade-up-4">
            <div className="p-1.5 rounded-t-3xl shadow-2xl"
              style={{ background: "var(--surface-container-high)" }}>
              <div className="bg-white rounded-t-2xl overflow-hidden aspect-[16/9] flex flex-col">
                {/* Browser bar */}
                <div className="h-10 flex items-center px-4 gap-2"
                  style={{ background: "var(--surface-container)" }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-auto w-1/3 h-6 rounded-md" style={{ background: "var(--surface-container-lowest)" }} />
                </div>
                {/* Mock content */}
                <div className="flex-1 p-6 grid grid-cols-12 gap-5"
                  style={{ background: "var(--surface-container-low)" }}>
                  <div className="col-span-3 space-y-3">
                    <div className="h-10 w-10 rounded-xl" style={{ background: "var(--primary-container)" }} />
                    <div className="h-3 w-full rounded" style={{ background: "var(--surface-container-high)" }} />
                    <div className="h-3 w-2/3 rounded" style={{ background: "var(--surface-container-high)" }} />
                    <div className="pt-4 space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-7 w-full rounded-lg" style={{ background: "var(--surface-container-lowest)" }} />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-9 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl shadow-sm"
                          style={{ background: "var(--surface-container-lowest)" }} />
                      ))}
                    </div>
                    <div className="h-48 rounded-2xl shadow-sm"
                      style={{ background: "var(--surface-container-lowest)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-8" style={{ background: "var(--surface-container)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 fade-up">
              <h2 className="font-semibold text-4xl mb-4"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                Precision Engineering for Careers
              </h2>
              <p className="max-w-xl" style={{ color: "var(--on-surface-variant)" }}>
                Move beyond basic keywords. Our AI analyzes your potential, not just your past.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map(({ icon, title, desc, bg, color }, i) => (
                <div key={title} className="card-stitch p-8 group hover:-translate-y-2 transition-all duration-300 cursor-default fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
                    style={{ background: bg }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color }}>{icon}</span>
                  </div>
                  <h3 className="font-bold text-xl mb-4"
                    style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-8" style={{ background: "var(--surface)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-up">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                Success Stories
              </span>
              <h2 className="font-semibold text-4xl mt-6"
                style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                Built for the Indian Talent
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map(({ name, role, city: c, text, init }, i) => (
                <div key={name} className="p-10 rounded-3xl flex flex-col justify-between fade-up"
                  style={{ background: "var(--surface-container-low)", animationDelay: `${i * 0.1}s` }}>
                  <p className="italic text-lg mb-8" style={{ color: "var(--on-surface)" }}>"{text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                      style={{ background: "var(--primary)", fontFamily: "var(--font-headline)" }}>
                      {init}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "var(--on-surface)" }}>{name}</p>
                      <p className="text-xs font-medium" style={{ color: "var(--on-surface-variant)" }}>{role} · {c}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8 fade-up">
          <div className="max-w-5xl mx-auto p-12 md:p-20 text-center rounded-[2.5rem] relative overflow-hidden"
            style={{ background: "var(--primary-container)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-32 -mt-32"
              style={{ background: "rgba(0,108,74,0.2)" }} />
            <h2 className="font-bold text-4xl md:text-5xl mb-8 relative z-10"
              style={{ fontFamily: "var(--font-headline)", color: "var(--on-primary-container)" }}>
              Ready to match with your future?
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative z-10">
              <button className="w-full md:w-auto px-10 py-4 font-bold rounded-2xl text-lg transition-colors"
                style={{ background: "var(--on-primary)", color: "var(--primary)" }}
                onClick={() => openAuth("signup")}>
                Create your profile
              </button>
              <button className="w-full md:w-auto px-10 py-4 font-bold rounded-2xl text-lg border-2 transition-colors"
                style={{ borderColor: "var(--on-primary-container)", color: "var(--on-primary-container)" }}
                onClick={() => openAuth("signup")}>
                Explore {city.name} Jobs
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-8" style={{ background: "var(--surface-container)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-1">
            <span className="text-2xl font-bold tracking-tighter mb-6 block"
              style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
              RoleMatch
            </span>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--on-surface-variant)" }}>
              Elevating the career search experience for India's premium tech talent.
            </p>
          </div>
          {[
            { title: "Platform", links: ["Job Board","Resume Matcher","Career Roadmap","Skill Insights"] },
            { title: "Locations", links: ["Hyderabad","Bengaluru","Pune","Remote India"] },
            { title: "Support", links: ["Help Center","Privacy Policy","Terms of Service","Contact Us"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-bold mb-6" style={{ color: "var(--on-surface)" }}>{title}</h4>
              <ul className="space-y-4">
                {links.map(link => (
                  <li key={link}>
                    <a className="text-sm font-medium transition-colors" style={{ color: "var(--on-surface-variant)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--primary)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--on-surface-variant)"}
                      href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
          style={{ borderTop: "1px solid var(--outline-variant)", color: "var(--on-surface-variant)" }}>
          <p>© {new Date().getFullYear()} RoleMatch India. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Made in Hyderabad with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
