import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Map Firebase error codes to human-readable messages
const getFirebaseError = (code: string): string => {
  const errors: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups for this site.",
  };
  return errors[code] || "Something went wrong. Please try again.";
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  // ── Email / Password Login ──────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      toast({ title: "Welcome back!", description: "You've signed in successfully." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: getFirebaseError(err.code),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Email / Password Sign Up ────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        signupForm.email,
        signupForm.password
      );
      // Set display name
      await updateProfile(user, { displayName: signupForm.name });
      // Send verification email
      await sendEmailVerification(user);
      toast({
        title: "Account created!",
        description: "A verification email has been sent. Please verify before signing in.",
      });
      setTab("login");
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: getFirebaseError(err.code),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign In ──────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Welcome!", description: "Signed in with Google." });
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast({
          title: "Google sign-in failed",
          description: getFirebaseError(err.code),
          variant: "destructive",
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const GoogleButton = ({ label }: { label: string }) => (
    <Button
      variant="outline"
      className="w-full mb-6 gap-2"
      onClick={handleGoogleSignIn}
      disabled={googleLoading}
      type="button"
    >
      {googleLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {label}
    </Button>
  );

  const OrDivider = () => (
    <div className="relative mb-6">
      <Separator />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
        or continue with email
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl text-white">CareerLaunch</span>
        </Link>

        <div className="z-10">
          <h2 className="font-heading text-4xl font-bold text-white leading-tight mb-4">
            Your next career move starts here.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Upload your resume, get AI-powered job matches, and track your
            applications — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: "10K+", label: "Jobs matched" },
              { value: "95%", label: "Match accuracy" },
              { value: "3min", label: "To first match" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-heading text-3xl font-bold text-white">{value}</div>
                <div className="text-white/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm z-10">
          © {new Date().getFullYear()} CareerLaunch
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-xl">
              Role<span className="text-accent">Match</span>
            </span>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-8">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Create Account</TabsTrigger>
            </TabsList>

            {/* ── LOGIN ── */}
            <TabsContent value="login">
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Sign in to your CareerLaunch account
                </p>
              </div>

              <GoogleButton label="Continue with Google" />
              <OrDivider />

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── SIGN UP ── */}
            <TabsContent value="signup">
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Start matching with your dream jobs today
                </p>
              </div>

              <GoogleButton label="Sign up with Google" />
              <OrDivider />

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Chaitanya Sai"
                      className="pl-9"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className="pl-9 pr-10"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      className="pl-9"
                      value={signupForm.confirm}
                      onChange={(e) => setSignupForm({ ...signupForm, confirm: e.target.value })}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to our{" "}
                  <a href="#" className="underline hover:text-foreground">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;