import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CityProvider } from "@/hooks/useCity";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatBubble from "@/components/advisor/ChatBubble";

// Pages
import Landing from "./pages/Landing";
import IndexPage from "./pages/Index";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import SkillGapPage from "./pages/SkillGap";
import AdvisorPage from "./pages/Advisor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

// ── Loading spinner ──────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading RoleMatch...</p>
    </div>
  </div>
);

// ── Protected route ──────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Dashboard page wrapper ───────────────────────────────────────
const DashPage = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <ProtectedRoute>
    <DashboardLayout title={title}>{children}</DashboardLayout>
  </ProtectedRoute>
);

// ── Routes ───────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Resume matcher — protected */}
        <Route path="/match" element={
          <ProtectedRoute>
            <DashboardLayout title="Resume Matcher">
              <IndexPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Dashboard pages */}
        <Route path="/dashboard" element={<DashPage title="Dashboard"><Dashboard /></DashPage>} />
        <Route path="/jobs" element={<DashPage title="Job Board"><JobBoard /></DashPage>} />
        <Route path="/saved" element={<DashPage title="Saved Jobs"><SavedJobs /></DashPage>} />
        <Route path="/profile" element={<DashPage title="My Profile"><Profile /></DashPage>} />
        <Route path="/skillgap" element={<SkillGapPage />} />
        <Route path="/advisor" element={<AdvisorPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Floating AI chat bubble — shown on all protected pages */}
      {user && <ChatBubble />}
    </>
  );
};

// ── App ──────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CityProvider>
              <AppRoutes />
            </CityProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;