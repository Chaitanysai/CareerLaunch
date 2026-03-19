import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, TrendingUp, MessageSquare, Target, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";

interface NegotiationResult {
  marketMin: number;
  marketMax: number;
  marketMedian: number;
  yourAsk: number;
  verdict: "underpaid" | "fair" | "above-market";
  verdictText: string;
  script: string;
  tactics: string[];
  counterOfferRange: { min: number; max: number };
  redFlags: string[];
  greenFlags: string[];
}

const SalaryCoach = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [form, setForm] = useState({
    jobTitle: "", experience: "3-5", currentCTC: "",
    offerCTC: "", company: "", skills: "", companySize: "startup",
  });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const analyze = async () => {
    if (!form.jobTitle || !form.offerCTC) {
      toast({ title: "Enter job title and offer amount", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const prompt = `You are a salary negotiation expert for the Indian tech job market.

Analyze this offer and provide negotiation guidance:
- Role: ${form.jobTitle}
- City: ${city.name}
- Experience: ${form.experience} years
- Current CTC: ${form.currentCTC || "not disclosed"} LPA
- Offer received: ${form.offerCTC} LPA
- Company: ${form.company || "not specified"} (${form.companySize})
- Key skills: ${form.skills || "software development"}

Respond ONLY with valid JSON (no markdown):
{
  "marketMin": 12,
  "marketMax": 25,
  "marketMedian": 18,
  "yourAsk": 22,
  "verdict": "underpaid",
  "verdictText": "2-sentence assessment of the offer vs market",
  "script": "Word-for-word negotiation script they can use on the call or email. 4-5 sentences. Professional and confident.",
  "tactics": ["tactic 1", "tactic 2", "tactic 3", "tactic 4"],
  "counterOfferRange": { "min": 20, "max": 24 },
  "redFlags": ["red flag 1 if any"],
  "greenFlags": ["positive aspect 1", "positive aspect 2"]
}

All salary values in LPA. verdict must be exactly "underpaid", "fair", or "above-market".`;

      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<NegotiationResult>(raw, null as any);
      setResult(parsed);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verdictStyle = {
    underpaid: { color: "text-red-600", bg: "bg-red-50 border-red-200", label: "You're being underpaid" },
    fair: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Fair market offer" },
    "above-market": { color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Above market rate!" },
  };

  return (
    <DashboardLayout title="Salary Coach">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Salary Negotiation Coach</h1>
          <p className="text-muted-foreground mt-1">Know your worth and negotiate confidently in {city.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" />Offer Details
              </CardTitle>
              <CardDescription>Enter your offer details for an honest assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Job Title *</Label>
                <Input placeholder="e.g. Senior Frontend Engineer" value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input placeholder="e.g. Swiggy, Infosys, Amazon" value={form.company} onChange={(e) => update("company", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Experience</Label>
                  <Select value={form.experience} onValueChange={(v) => update("experience", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">Fresher</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-8">5-8 years</SelectItem>
                      <SelectItem value="8+">8+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Company Size</Label>
                  <Select value={form.companySize} onValueChange={(v) => update("companySize", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (&lt;200)</SelectItem>
                      <SelectItem value="midsize">Mid-size (200-2000)</SelectItem>
                      <SelectItem value="large">Large (2000+)</SelectItem>
                      <SelectItem value="mnc">MNC / FAANG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Current CTC (LPA)</Label>
                  <Input placeholder="e.g. 12" value={form.currentCTC} onChange={(e) => update("currentCTC", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Offer Received (LPA) *</Label>
                  <Input placeholder="e.g. 18" value={form.offerCTC} onChange={(e) => update("offerCTC", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Your Skills</Label>
                <Input placeholder="e.g. React, AWS, TypeScript, System Design" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
              </div>
              <Button onClick={analyze} disabled={loading} className="w-full gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {city.name} market...</> : <><TrendingUp className="h-4 w-4" />Analyze My Offer</>}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {!result ? (
              <Card className="card-shadow h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground text-sm">Enter your offer details to get a market analysis</p>
                  <p className="text-muted-foreground text-xs mt-1">We'll tell you if you should negotiate and exactly what to say</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Verdict */}
                <Card className={`card-shadow border ${verdictStyle[result.verdict].bg}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={`${verdictStyle[result.verdict].color} bg-transparent border-current`}>
                        {verdictStyle[result.verdict].label}
                      </Badge>
                      <span className={`font-heading text-2xl font-bold ${verdictStyle[result.verdict].color}`}>
                        ₹{form.offerCTC}L
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{result.verdictText}</p>
                  </CardContent>
                </Card>

                {/* Market range */}
                <Card className="card-shadow">
                  <CardContent className="p-5">
                    <p className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />Market Range in {city.name}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: "Min", value: result.marketMin, color: "text-muted-foreground" },
                        { label: "Median", value: result.marketMedian, color: "text-accent font-bold" },
                        { label: "Max", value: result.marketMax, color: "text-foreground" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">{label}</p>
                          <p className={`font-heading text-lg font-bold ${color}`}>₹{value}L</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-accent/5 border border-accent/20 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Your counter-offer range</p>
                      <p className="font-heading font-bold text-accent text-lg">
                        ₹{result.counterOfferRange.min}L – ₹{result.counterOfferRange.max}L
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Script */}
                <Card className="card-shadow border-accent/20">
                  <CardContent className="p-5">
                    <p className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-accent" />Your Negotiation Script
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground leading-relaxed italic border border-border/50">
                      "{result.script}"
                    </div>
                  </CardContent>
                </Card>

                {/* Tactics */}
                <Card className="card-shadow">
                  <CardContent className="p-5">
                    <p className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />Negotiation Tactics
                    </p>
                    <div className="space-y-2">
                      {result.tactics.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-accent mt-0.5 shrink-0">→</span>
                          <span className="text-foreground">{t}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Flags */}
                {(result.greenFlags.length > 0 || result.redFlags.length > 0) && (
                  <Card className="card-shadow">
                    <CardContent className="p-5 space-y-3">
                      {result.greenFlags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />Positives
                          </p>
                          {result.greenFlags.map((f, i) => (
                            <p key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-green-500">•</span>{f}
                            </p>
                          ))}
                        </div>
                      )}
                      {result.redFlags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />Watch out
                          </p>
                          {result.redFlags.map((f, i) => (
                            <p key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-red-500">•</span>{f}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalaryCoach;
