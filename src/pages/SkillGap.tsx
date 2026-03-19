import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { analyzeSkillGap, SkillGapResult } from "@/services/gemini";
import { useCity } from "@/hooks/useCity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Plus, X, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SkillGapPage = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapResult | null>(null);

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setNewSkill(""); }
  };

  const analyze = async () => {
    if (!jobTitle || skills.length === 0) {
      toast({ title: "Add your job title and at least one skill", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await analyzeSkillGap(skills, jobTitle, city.name);
      setResult(data);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { high: "text-red-500 bg-red-50 border-red-200", medium: "text-amber-600 bg-amber-50 border-amber-200", low: "text-emerald-600 bg-emerald-50 border-emerald-200" };

  return (
    <DashboardLayout title="Skill Gap Analysis">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Input card */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Analyze your skill gaps for {city.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Target Job Title</label>
              <Input placeholder="e.g. Senior React Developer, Data Scientist..."
                value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Your Current Skills</label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[36px]">
                {skills.map((s) => (
                  <Badge key={s} className="gap-1.5 bg-accent/10 text-accent border-accent/20">
                    {s}
                    <button onClick={() => setSkills(skills.filter((x) => x !== s))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type a skill and press Enter..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                <Button variant="outline" size="icon" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <Button onClick={analyze} disabled={loading} className="w-full gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {city.name} market...</>
                : <><TrendingUp className="h-4 w-4" />Analyze Skill Gap</>}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in-up">

            {/* Market insight */}
            <Card className="card-shadow border-accent/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">Market Insight — {city.name}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{result.marketInsight}</p>
                    <p className="text-accent text-sm font-medium mt-2">{result.salaryImpact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* City demand */}
            <Card className="card-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">Skill demand in {city.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.cityDemand.map(({ skill, demand, youHave }) => (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{skill}</span>
                        {youHave
                          ? <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">You have this</span>
                          : <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">Missing</span>}
                      </div>
                      <span className="text-sm text-muted-foreground">{demand}%</span>
                    </div>
                    <Progress value={demand} className="h-2"
                      style={{ "--tw-bg-opacity": youHave ? "1" : "0.5" } as any} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Missing skills roadmap */}
            {result.missingSkills.length > 0 && (
              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Skills to acquire — prioritized for {city.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.missingSkills.map(({ skill, priority, timeToLearn, resources }) => (
                    <div key={skill} className="border border-border/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{skill}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor[priority]}`}>
                            {priority} priority
                          </span>
                          <span className="text-xs text-muted-foreground">{timeToLearn}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resources.map((r) => (
                          <span key={r} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <BookOpen className="h-3 w-3" />{r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SkillGapPage;
