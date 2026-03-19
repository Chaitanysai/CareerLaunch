import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Map, ArrowRight, CheckCircle, Clock, BookOpen, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapStep {
  level: number;
  title: string;
  timeframe: string;
  salaryRange: { min: number; max: number };
  skillsToLearn: string[];
  certifications: string[];
  actions: string[];
  companies: string[];
}

interface Roadmap {
  currentRole: string;
  targetRole: string;
  totalTime: string;
  steps: RoadmapStep[];
  summary: string;
}

const CareerRoadmap = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [form, setForm] = useState({
    currentRole: "", targetRole: "", currentExp: "1-3", currentSkills: "",
  });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.currentRole || !form.targetRole) {
      toast({ title: "Enter both current and target roles", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const prompt = `You are a career coach expert in the Indian tech industry. Create a detailed career roadmap.

From: ${form.currentRole} (${form.currentExp} years experience)
To: ${form.targetRole}
Location: ${city.name}, India
Current skills: ${form.currentSkills || "general software development"}

Create a step-by-step roadmap with realistic timeframes for the Indian job market.

Respond ONLY with valid JSON (no markdown):
{
  "currentRole": "${form.currentRole}",
  "targetRole": "${form.targetRole}",
  "totalTime": "e.g. 18-24 months",
  "summary": "2-sentence overview of the journey",
  "steps": [
    {
      "level": 1,
      "title": "e.g. Mid-level Developer",
      "timeframe": "e.g. 0-6 months",
      "salaryRange": { "min": 12, "max": 18 },
      "skillsToLearn": ["skill1", "skill2", "skill3"],
      "certifications": ["cert1"],
      "actions": ["action1", "action2", "action3"],
      "companies": ["company1 in ${city.name}", "company2"]
    }
  ]
}

Create 3-5 steps. Salary in LPA. Be specific to ${city.name} tech market. Include real Indian companies at each level.`;

      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<Roadmap>(raw, null as any);
      setRoadmap(parsed);
      setExpandedStep(0);
    } catch (err: any) {
      toast({ title: "Failed to generate roadmap", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Career Roadmap">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Career Roadmap</h1>
          <p className="text-muted-foreground mt-1">Your personalised path from where you are to where you want to be</p>
        </div>

        {/* Input */}
        <Card className="card-shadow mb-8">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label>Current Role *</Label>
                <Input placeholder="e.g. Junior Frontend Developer" value={form.currentRole} onChange={(e) => update("currentRole", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Target / Dream Role *</Label>
                <Input placeholder="e.g. Engineering Manager, Staff Engineer" value={form.targetRole} onChange={(e) => update("targetRole", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Current Experience</Label>
                <Select value={form.currentExp} onValueChange={(v) => update("currentExp", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-8">5-8 years</SelectItem>
                    <SelectItem value="8+">8+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Current Skills</Label>
                <Input placeholder="e.g. React, JavaScript, HTML/CSS" value={form.currentSkills} onChange={(e) => update("currentSkills", e.target.value)} />
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Building your roadmap...</> : <><Map className="h-4 w-4" />Generate My Career Roadmap</>}
            </Button>
          </CardContent>
        </Card>

        {/* Roadmap */}
        {roadmap && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="text-center px-4">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-heading font-semibold text-foreground">{roadmap.currentRole}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-accent shrink-0" />
              <div className="text-center px-4">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-heading font-semibold text-accent">{roadmap.targetRole}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground mb-1">Total time</p>
                <Badge className="bg-accent/10 text-accent border-accent/20">{roadmap.totalTime}</Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground px-1">{roadmap.summary}</p>

            {/* Steps */}
            {roadmap.steps.map((step, idx) => (
              <Card key={idx} className={cn("card-shadow transition-all", expandedStep === idx && "border-accent/30")}>
                <button className="w-full text-left" onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        idx === 0 ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="font-heading text-base">{step.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">{step.timeframe}</Badge>
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                            ₹{step.salaryRange.min}L – ₹{step.salaryRange.max}L
                          </Badge>
                        </div>
                      </div>
                      {expandedStep === idx
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>
                  </CardHeader>
                </button>

                {expandedStep === idx && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Skills to learn */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-blue-500" />Skills to Learn
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.skillsToLearn.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      {step.certifications.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />Certifications
                          </p>
                          {step.certifications.map((c) => (
                            <p key={c} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-green-500">•</span>{c}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                        <ArrowRight className="h-3.5 w-3.5 text-accent" />Action Items
                      </p>
                      <div className="space-y-1.5">
                        {step.actions.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-accent mt-0.5 shrink-0">→</span>
                            <span className="text-foreground">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target companies */}
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-purple-500" />Target Companies in {city.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.companies.map((c) => (
                          <Badge key={c} className="bg-purple-50 text-purple-700 border-purple-200 text-xs dark:bg-purple-900/20 dark:text-purple-400">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {!roadmap && !loading && (
          <div className="text-center py-16">
            <Map className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="font-heading font-semibold text-foreground mb-2">Build your career roadmap</p>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Enter your current and target role to get a personalised step-by-step path with skills, timelines and target companies
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CareerRoadmap;
