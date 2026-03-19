import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI, safeParseJSON } from "@/services/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Search, Star, TrendingUp, Users, DollarSign, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

interface CompanyResearch {
  name: string; founded: string; size: string; type: string;
  headquarters: string; industry: string; description: string;
  salaryRanges: { role: string; min: number; max: number }[];
  ratings: { overall: number; workLifeBalance: number; growth: number; culture: number; management: number };
  pros: string[]; cons: string[];
  interviewProcess: string[];
  techStack: string[];
  recentNews: string[];
  hiringStatus: "actively-hiring" | "selective" | "freeze";
  verdict: string;
}

const CompanyResearch = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompanyResearch | null>(null);

  const research = async () => {
    if (!company.trim()) { toast({ title: "Enter a company name", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const prompt = `You are an expert on Indian tech companies. Provide detailed research on "${company}" for a job seeker in ${city.name}, India.

Respond ONLY with valid JSON (no markdown):
{
  "name": "${company}",
  "founded": "year",
  "size": "e.g. 10,000+ employees",
  "type": "e.g. Startup / MNC / Product / Service",
  "headquarters": "city",
  "industry": "e.g. Fintech, E-commerce",
  "description": "3-sentence company overview",
  "salaryRanges": [
    {"role": "Software Engineer", "min": 12, "max": 20},
    {"role": "Senior Engineer", "min": 20, "max": 35},
    {"role": "Engineering Manager", "min": 35, "max": 60}
  ],
  "ratings": {
    "overall": 3.8,
    "workLifeBalance": 3.5,
    "growth": 4.0,
    "culture": 3.7,
    "management": 3.6
  },
  "pros": ["pro1", "pro2", "pro3", "pro4"],
  "cons": ["con1", "con2", "con3"],
  "interviewProcess": ["Round 1: description", "Round 2: description", "Round 3: description"],
  "techStack": ["React", "Node.js", "AWS", "etc"],
  "recentNews": ["news item 1", "news item 2"],
  "hiringStatus": "actively-hiring",
  "verdict": "2-sentence honest verdict on whether to join this company"
}

All salary values in LPA. hiringStatus: "actively-hiring", "selective", or "freeze". Be honest and accurate.`;

      const raw = await callAI(null, prompt);
      const parsed = safeParseJSON<CompanyResearch>(raw, null as any);
      setData(parsed);
    } catch (err: any) {
      toast({ title: "Research failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hiringBadge = {
    "actively-hiring": "bg-green-50 text-green-700 border-green-200",
    selective: "bg-amber-50 text-amber-700 border-amber-200",
    freeze: "bg-red-50 text-red-700 border-red-200",
  };

  const RatingBar = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}/5</span>
      </div>
      <Progress value={(value / 5) * 100} className="h-1.5" />
    </div>
  );

  return (
    <DashboardLayout title="Company Research">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Company Research</h1>
          <p className="text-muted-foreground mt-1">AI-powered insights on any Indian company — culture, salary, interview process</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-11" placeholder="Enter company name e.g. Flipkart, Razorpay, TCS, Infosys..."
              value={company} onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && research()} />
          </div>
          <Button onClick={research} disabled={loading} className="h-11 px-6 gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Research
          </Button>
        </div>

        {loading && (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
            <p className="text-muted-foreground">Researching {company}...</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Header card */}
            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-heading text-2xl font-bold text-foreground">{data.name}</h2>
                      <Badge className={`border text-xs ${hiringBadge[data.hiringStatus]}`}>
                        {data.hiringStatus === "actively-hiring" ? "Actively Hiring" : data.hiringStatus === "selective" ? "Selective Hiring" : "Hiring Freeze"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{data.industry}</span>
                      <span>•</span><span>{data.type}</span>
                      <span>•</span><span>{data.size}</span>
                      <span>•</span><span>Founded {data.founded}</span>
                      <span>•</span><span>HQ: {data.headquarters}</span>
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="font-heading text-3xl font-bold text-accent">{data.ratings.overall}</div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.round(data.ratings.overall) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Ratings */}
              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />Ratings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RatingBar label="Work-Life Balance" value={data.ratings.workLifeBalance} />
                  <RatingBar label="Career Growth" value={data.ratings.growth} />
                  <RatingBar label="Culture & Values" value={data.ratings.culture} />
                  <RatingBar label="Management" value={data.ratings.management} />
                </CardContent>
              </Card>

              {/* Salary */}
              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />Salary Ranges (LPA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {data.salaryRanges.map((s) => (
                    <div key={s.role} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-sm font-medium text-foreground">{s.role}</span>
                      <span className="text-sm font-bold text-accent">₹{s.min}L – ₹{s.max}L</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pros & Cons */}
              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm">Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-2">
                      <ThumbsUp className="h-3.5 w-3.5" />Pros
                    </p>
                    {data.pros.map((p, i) => (
                      <p key={i} className="text-sm flex items-start gap-2 mb-1">
                        <span className="text-green-500 mt-0.5">✓</span>{p}
                      </p>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-2">
                      <ThumbsDown className="h-3.5 w-3.5" />Cons
                    </p>
                    {data.cons.map((c, i) => (
                      <p key={i} className="text-sm flex items-start gap-2 mb-1">
                        <span className="text-red-400 mt-0.5">✗</span>{c}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interview Process */}
              <Card className="card-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />Interview Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.interviewProcess.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Tech stack */}
            <Card className="card-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.techStack.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verdict */}
            <Card className="card-shadow border-accent/20 bg-accent/5">
              <CardContent className="p-5 flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-semibold text-foreground mb-1">Verdict</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.verdict}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-20">
            <Building2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="font-heading font-semibold text-foreground mb-2">Research any company</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Get AI-powered insights on salary ranges, culture, interview process, pros & cons — for any Indian tech company
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyResearch;
