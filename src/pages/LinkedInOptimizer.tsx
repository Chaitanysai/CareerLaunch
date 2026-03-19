import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Linkedin, Sparkles, Copy, TrendingUp, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

interface LinkedInResult {
  score: number;
  optimizedHeadline: string;
  optimizedAbout: string;
  keywordSuggestions: string[];
  sectionTips: { section: string; tip: string; priority: "high" | "medium" | "low" }[];
  quickWins: string[];
}

const LinkedInOptimizer = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [form, setForm] = useState({
    currentHeadline: "", about: "", targetRole: "", experience: "3-5",
  });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const optimize = async () => {
    if (!form.currentHeadline && !form.about) {
      toast({ title: "Paste your LinkedIn headline or About section", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const prompt = `You are a LinkedIn profile optimization expert for the Indian job market.

Analyze and optimize this LinkedIn profile for ${city.name}, India:
- Current Headline: ${form.currentHeadline || "not provided"}
- About/Summary: ${form.about || "not provided"}
- Target Role: ${form.targetRole || "software engineer"}
- Experience: ${form.experience} years

Respond ONLY with valid JSON (no markdown):
{
  "score": 65,
  "optimizedHeadline": "Optimized headline under 220 chars | with keywords | for Indian recruiters",
  "optimizedAbout": "Rewritten About section of 200-250 words. Include: hook, value prop, key skills, achievements with numbers, CTA. India-specific. ATS keywords. First person.",
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "sectionTips": [
    { "section": "Profile Photo", "tip": "actionable tip", "priority": "high" },
    { "section": "Experience", "tip": "actionable tip", "priority": "high" },
    { "section": "Skills", "tip": "actionable tip", "priority": "medium" },
    { "section": "Recommendations", "tip": "actionable tip", "priority": "medium" },
    { "section": "Featured", "tip": "actionable tip", "priority": "low" }
  ],
  "quickWins": ["quick win 1", "quick win 2", "quick win 3", "quick win 4"]
}

score: current profile score 0-100. Be honest. Optimize for Indian recruiters and ATS.`;

      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<LinkedInResult>(raw, null as any);
      setResult(parsed);
    } catch (err: any) {
      toast({ title: "Optimization failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const priorityStyle = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-green-50 text-green-700 border-green-200",
  };

  const scoreColor = result
    ? result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-amber-600" : "text-red-600"
    : "";

  return (
    <DashboardLayout title="LinkedIn Optimizer">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">LinkedIn Profile Optimizer</h1>
          <p className="text-muted-foreground mt-1">AI rewrites your profile to attract Indian recruiters and pass ATS filters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <Card className="card-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />Your Current Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current LinkedIn Headline</Label>
                  <Input placeholder="e.g. Software Engineer at TCS | React | Node.js"
                    value={form.currentHeadline} onChange={(e) => update("currentHeadline", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Role</Label>
                  <Input placeholder="e.g. Senior Frontend Engineer"
                    value={form.targetRole} onChange={(e) => update("targetRole", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Experience Level</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["0-1","Fresher"],["1-3","Junior"],["3-5","Mid"],["5-8","Senior"],["8+","Lead"]].map(([v, l]) => (
                      <button key={v} onClick={() => update("experience", v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.experience === v ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/30"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Current About / Summary (paste from LinkedIn)</Label>
                  <Textarea placeholder="Paste your current LinkedIn About section here..."
                    rows={6} value={form.about} onChange={(e) => update("about", e.target.value)} />
                </div>
                <Button onClick={optimize} disabled={loading} className="w-full gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Optimizing...</> : <><Sparkles className="h-4 w-4" />Optimize My Profile</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {!result ? (
              <Card className="card-shadow h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Linkedin className="h-12 w-12 text-[#0A66C2] mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground text-sm">Paste your LinkedIn content and click Optimize</p>
                  <p className="text-muted-foreground text-xs mt-1">We'll rewrite your headline, about section and give actionable tips</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score */}
                <Card className="card-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-semibold text-foreground">Profile Score</span>
                      <span className={`font-heading text-3xl font-bold ${scoreColor}`}>{result.score}/100</span>
                    </div>
                    <Progress value={result.score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {result.score >= 80 ? "Strong profile — minor tweaks needed" : result.score >= 60 ? "Good base — several improvements recommended" : "Needs significant work — follow the tips below"}
                    </p>
                  </CardContent>
                </Card>

                {/* Optimized headline */}
                <Card className="card-shadow">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-sm">Optimized Headline</CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => copy(result.optimizedHeadline, "Headline")}>
                      <Copy className="h-3 w-3" />Copy
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 leading-relaxed border border-border/50">
                      {result.optimizedHeadline}
                    </p>
                  </CardContent>
                </Card>

                {/* Optimized About */}
                <Card className="card-shadow">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-sm">Optimized About Section</CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => copy(result.optimizedAbout, "About section")}>
                      <Copy className="h-3 w-3" />Copy
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap border border-border/50">
                      {result.optimizedAbout}
                    </p>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm">Keywords to Add</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordSuggestions.map((k) => (
                        <Badge key={k} className="bg-accent/10 text-accent border-accent/20 text-xs">{k}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Section tips */}
                <Card className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />Section-by-Section Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {result.sectionTips.map((t) => (
                      <div key={t.section} className="flex items-start gap-3">
                        <Badge className={`text-xs border shrink-0 ${priorityStyle[t.priority]}`}>{t.section}</Badge>
                        <p className="text-sm text-foreground">{t.tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick wins */}
                <Card className="card-shadow border-green-200 bg-green-50/30 dark:bg-green-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />Quick Wins (Do Today)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.quickWins.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{w}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LinkedInOptimizer;
