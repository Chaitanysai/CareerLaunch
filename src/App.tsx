import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CityProvider } from "@/hooks/useCity";
import { ThemeProvider } from "@/hooks/useTheme";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatBubble from "@/components/advisor/ChatBubble";

// Core pages
import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import SkillGapPage from "./pages/SkillGap";
import AdvisorPage from "./pages/Advisor";
import NotFound from "./pages/NotFound";

// Tools
import InterviewPrep from "./pages/InterviewPrep";
import ResumeBuilder from "./pages/ResumeBuilder";
import CoverLetter from "./pages/CoverLetter";
import SalaryCoach from "./pages/SalaryCoach";

// Research
import CompanyResearch from "./pages/CompanyResearch";
import CareerRoadmap from "./pages/CareerRoadmap";
import LinkedInOptimizer from "./pages/LinkedInOptimizer";
import JobTracker from "./pages/JobTracker";

// Resume Matcher (Index)
import ResumeMatcher from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>Loading RoleMatch...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DashPage = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <ProtectedRoute>
    <DashboardLayout title={title}>{children}</DashboardLayout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Main */}
        <Route path="/dashboard" element={<DashPage title="Dashboard"><Dashboard /></DashPage>} />
        <Route path="/match" element={<DashPage title="Resume Matcher"><ResumeMatcher /></DashPage>} />
        <Route path="/jobs" element={<DashPage title="Job Board"><JobBoard /></DashPage>} />
        <Route path="/saved" element={<DashPage title="Saved Jobs"><SavedJobs /></DashPage>} />
        <Route path="/profile" element={<DashPage title="My Profile"><Profile /></DashPage>} />
        <Route path="/skillgap" element={<SkillGapPage />} />
        <Route path="/advisor" element={<AdvisorPage />} />

        {/* Tools */}
        <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/cover-letter" element={<ProtectedRoute><CoverLetter /></ProtectedRoute>} />
        <Route path="/salary-coach" element={<ProtectedRoute><SalaryCoach /></ProtectedRoute>} />

        {/* Research */}
        <Route path="/company-research" element={<ProtectedRoute><CompanyResearch /></ProtectedRoute>} />
        <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
        <Route path="/linkedin" element={<ProtectedRoute><LinkedInOptimizer /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><JobTracker /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <ChatBubble />}
    </>
  );
};

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
