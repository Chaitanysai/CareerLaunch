import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ResumeUpload from "@/components/ResumeUpload";
import JobCard, { type Job } from "@/components/JobCard";
import SkillsSummary from "@/components/SkillsSummary";

interface AnalysisResult {
  suggestedTitle: string;
  experience: string;
  skills: string[];
  jobs: Job[];
}

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Read file as text
      const text = await file.text();

      const { data, error } = await supabase.functions.invoke("match-jobs", {
        body: { resumeText: text.slice(0, 8000) },
      });

      if (error) throw error;

      setResult(data as AnalysisResult);
      toast({ title: "Done!", description: `Found ${data.jobs.length} matching jobs.` });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to analyze resume.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="hero-gradient py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground/90">AI-Powered Job Matching</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-primary-foreground leading-tight">
            Find Jobs That Match <br className="hidden sm:block" />
            <span className="opacity-80">Your Resume</span>
          </h1>

          <p className="mt-4 text-lg text-primary-foreground/70 max-w-xl mx-auto">
            Upload your resume and let AI analyze your skills to find the most relevant job opportunities.
          </p>
        </div>
      </header>

      {/* Upload Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-card rounded-xl p-6 sm:p-8 card-shadow border border-border/50">
          <ResumeUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 card-shadow border border-border/50 animate-pulse-slow" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6 pb-16">
            <SkillsSummary
              skills={result.skills}
              suggestedTitle={result.suggestedTitle}
              experience={result.experience}
            />

            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              <h2 className="font-heading font-semibold text-xl text-foreground">
                {result.jobs.length} Matching Jobs
              </h2>
            </div>

            <div className="space-y-4">
              {result.jobs.map((job, i) => (
                <div
                  key={i}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
