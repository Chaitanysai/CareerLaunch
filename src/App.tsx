import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CityProvider } from "@/hooks/useCity";
import { ThemeProvider } from "@/hooks/useTheme";
import ChatBubble from "@/components/advisor/ChatBubble";

// All pages — imported directly, NO DashPage wrapper for pages that have their own DashboardLayout
import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// These pages ALREADY contain <DashboardLayout> inside them — do NOT wrap again
import ResumeMatcher from "./pages/Index";
import SkillGapPage from "./pages/SkillGap";
import AdvisorPage from "./pages/Advisor";
import InterviewPrep from "./pages/InterviewPrep";
import ResumeBuilder from "./pages/ResumeBuilder";
import CoverLetter from "./pages/CoverLetter";
import SalaryCoach from "./pages/SalaryCoach";
import CompanyResearch from "./pages/CompanyResearch";
import CareerRoadmap from "./pages/CareerRoadmap";
import LinkedInOptimizer from "./pages/LinkedInOptimizer";
import JobTracker from "./pages/JobTracker";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

// ── Loading spinner ──────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center"
    style={{ background: "var(--surface)" }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
        Loading CareerLaunch...
      </p>
    </div>
  </div>
);

// ── Auth guard — redirects to / if not logged in ─────────────────
const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Routes ───────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"     element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* ── Protected — pages that render their OWN DashboardLayout ── */}
        {/* Each of these pages calls <DashboardLayout> internally.       */}
        {/* Do NOT add another wrapper here or you get double topbar.     */}
        <Route path="/dashboard"       element={<Protected><Dashboard /></Protected>} />
        <Route path="/match"           element={<Protected><ResumeMatcher /></Protected>} />
        <Route path="/jobs"            element={<Protected><JobBoard /></Protected>} />
        <Route path="/saved"           element={<Protected><SavedJobs /></Protected>} />
        <Route path="/profile"         element={<Protected><Profile /></Protected>} />
        <Route path="/skillgap"        element={<Protected><SkillGapPage /></Protected>} />
        <Route path="/advisor"         element={<Protected><AdvisorPage /></Protected>} />
        <Route path="/interview"       element={<Protected><InterviewPrep /></Protected>} />
        <Route path="/resume-builder"  element={<Protected><ResumeBuilder /></Protected>} />
        <Route path="/cover-letter"    element={<Protected><CoverLetter /></Protected>} />
        <Route path="/salary-coach"    element={<Protected><SalaryCoach /></Protected>} />
        <Route path="/company-research" element={<Protected><CompanyResearch /></Protected>} />
        <Route path="/career-roadmap"  element={<Protected><CareerRoadmap /></Protected>} />
        <Route path="/linkedin"        element={<Protected><LinkedInOptimizer /></Protected>} />
        <Route path="/tracker"         element={<Protected><JobTracker /></Protected>} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Floating chat bubble — shown on all protected pages */}
      {user && <ChatBubble />}
    </>
  );
};

// ── Root ─────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CityProvider>
              <ThemeProvider>
                <AppRoutes />
              </ThemeProvider>
            </CityProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </NextThemeProvider>
  </QueryClientProvider>
);

export default App;
