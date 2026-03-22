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
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
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

// ── Env validation at startup ── fixes #11
const REQUIRED_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
];
const missingEnv = REQUIRED_ENV.filter(k => !import.meta.env[k]);
if (missingEnv.length > 0) {
  console.error("⚠️ CareerLaunch: Missing environment variables:", missingEnv.join(", "));
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center"
    style={{ background: "var(--surface)" }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>Loading CareerLaunch...</p>
    </div>
  </div>
);

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  // Wrap each protected page in its own boundary so one crash doesn't kill the whole app
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/"     element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected — each page owns its DashboardLayout */}
        <Route path="/dashboard"        element={<Protected><Dashboard /></Protected>} />
        <Route path="/match"            element={<Protected><ResumeMatcher /></Protected>} />
        <Route path="/jobs"             element={<Protected><JobBoard /></Protected>} />
        <Route path="/saved"            element={<Protected><SavedJobs /></Protected>} />
        <Route path="/profile"          element={<Protected><Profile /></Protected>} />
        <Route path="/skillgap"         element={<Protected><SkillGapPage /></Protected>} />
        <Route path="/advisor"          element={<Protected><AdvisorPage /></Protected>} />
        <Route path="/interview"        element={<Protected><InterviewPrep /></Protected>} />
        <Route path="/resume-builder"   element={<Protected><ResumeBuilder /></Protected>} />
        <Route path="/cover-letter"     element={<Protected><CoverLetter /></Protected>} />
        <Route path="/salary-coach"     element={<Protected><SalaryCoach /></Protected>} />
        <Route path="/company-research" element={<Protected><CompanyResearch /></Protected>} />
        <Route path="/career-roadmap"   element={<Protected><CareerRoadmap /></Protected>} />
        <Route path="/linkedin"         element={<Protected><LinkedInOptimizer /></Protected>} />
        <Route path="/tracker"          element={<Protected><JobTracker /></Protected>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <ChatBubble />}
    </>
  );
};

const App = () => (
  // Top-level ErrorBoundary — catches anything that escapes page-level boundaries
  <ErrorBoundary>
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
  </ErrorBoundary>
);

export default App;
