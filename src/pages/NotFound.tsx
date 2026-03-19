import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mb-6 shadow-lg">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="font-heading text-6xl font-bold text-foreground mb-3">404</h1>
      <p className="font-heading text-xl font-semibold text-foreground mb-2">Page not found</p>
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
