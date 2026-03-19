import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { callAI } from "@/services/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Copy, Download, RefreshCw, FileEdit } from "lucide-react";

const TONES = [
  { value: "professional", label: "Professional & Formal" },
  { value: "enthusiastic", label: "Enthusiastic & Energetic" },
  { value: "concise", label: "Concise & Direct" },
  { value: "storytelling", label: "Story-driven & Personal" },
];

const CoverLetter = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [form, setForm] = useState({
    yourName: "", jobTitle: "", company: "",
    experience: "3-5", tone: "professional",
    skills: "", achievement: "", hiringManager: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.jobTitle || !form.company) {
      toast({ title: "Enter job title and company", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const prompt = `Write a ${form.tone} cover letter for a ${form.jobTitle} position at ${form.company} in ${city.name}, India.

Candidate details:
- Name: ${form.yourName || "the candidate"}
- Experience: ${form.experience} years
- Key skills: ${form.skills || "software development"}
- Key achievement: ${form.achievement || "delivered impactful projects"}
- Hiring Manager: ${form.hiringManager || "Hiring Manager"}

Requirements:
- 3 paragraphs: opening hook, value proposition, closing call-to-action
- India-specific context (mention Indian tech ecosystem if relevant)
- ATS-friendly language
- Mention ${city.name} location
- 250-300 words total
- Professional email format with greeting and sign-off
- No placeholder brackets — use actual content

Return ONLY the cover letter text, no extra commentary.`;

      const result = await callAI(null, prompt);
      setLetter(result.trim());
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    toast({ title: "Copied to clipboard!" });
  };

  const download = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover_letter_${form.company}_${form.jobTitle}.txt`.replace(/\s+/g, "_");
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  return (
    <DashboardLayout title="Cover Letter Generator">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Cover Letter Generator</h1>
          <p className="text-muted-foreground mt-1">AI-crafted cover letters tailored to Indian companies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input form */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-accent" />Job Details
              </CardTitle>
              <CardDescription>Fill in the details to personalise your letter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Your Name</Label>
                  <Input placeholder="Chaitanya Sai" value={form.yourName} onChange={(e) => update("yourName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Hiring Manager</Label>
                  <Input placeholder="e.g. Priya Sharma" value={form.hiringManager} onChange={(e) => update("hiringManager", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Job Title *</Label>
                <Input placeholder="e.g. Senior React Developer" value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Company *</Label>
                <Input placeholder="e.g. Flipkart, Razorpay, Swiggy" value={form.company} onChange={(e) => update("company", e.target.value)} />
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
                  <Label>Tone</Label>
                  <Select value={form.tone} onValueChange={(v) => update("tone", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Top Skills</Label>
                <Input placeholder="e.g. React, TypeScript, Node.js, AWS" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Key Achievement</Label>
                <Input placeholder="e.g. Reduced load time by 40% at my current company" value={form.achievement} onChange={(e) => update("achievement", e.target.value)} />
              </div>
              <Button onClick={generate} disabled={loading} className="w-full gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate Cover Letter</>}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <div className="space-y-3">
            <Card className="card-shadow h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-base">Generated Letter</CardTitle>
                {letter && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={generate} disabled={loading}>
                      <RefreshCw className="h-3.5 w-3.5" />Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={copyToClipboard}>
                      <Copy className="h-3.5 w-3.5" />Copy
                    </Button>
                    <Button size="sm" className="gap-1.5 h-8" onClick={download}>
                      <Download className="h-3.5 w-3.5" />Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!letter ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileEdit className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
                    <p className="text-muted-foreground text-sm">Fill in the form and click Generate</p>
                    <p className="text-muted-foreground text-xs mt-1">Your personalised cover letter will appear here</p>
                  </div>
                ) : (
                  <Textarea
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    className="min-h-[480px] text-sm leading-relaxed font-mono resize-none"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoverLetter;
