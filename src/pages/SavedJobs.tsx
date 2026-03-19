import { useState } from "react";
import { BookmarkCheck, Trash2, ExternalLink, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCity } from "@/hooks/useCity";

const SAVED_JOBS = [
  { id: 1, title: "Senior Frontend Engineer", company: "Flipkart", location: "Bengaluru", type: "Hybrid", salaryMin: 22, salaryMax: 35, matchScore: 94, skills: ["React", "TypeScript"], url: "#", savedDate: "Today", status: "saved" },
  { id: 2, title: "Full Stack Developer", company: "Razorpay", location: "Bengaluru", type: "Full-time", salaryMin: 18, salaryMax: 28, matchScore: 87, skills: ["React", "Node.js"], url: "#", savedDate: "Yesterday", status: "applied" },
  { id: 3, title: "React Developer", company: "Swiggy", location: "Hyderabad", type: "Full-time", salaryMin: 15, salaryMax: 25, matchScore: 82, skills: ["Next.js", "TypeScript"], url: "#", savedDate: "3 days ago", status: "interview" },
  { id: 4, title: "Software Engineer II", company: "CRED", location: "Bengaluru", type: "Full-time", salaryMin: 20, salaryMax: 30, matchScore: 79, skills: ["TypeScript", "Go"], url: "#", savedDate: "5 days ago", status: "saved" },
];

const statusConfig = {
  saved: { label: "Saved", color: "bg-secondary text-secondary-foreground" },
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  interview: { label: "Interview", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  offer: { label: "Offer!", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

const SavedJobs = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const [jobs, setJobs] = useState(SAVED_JOBS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const removeJob = (id: number) => setJobs((prev) => prev.filter((j) => j.id !== id));
  const updateStatus = (id: number, status: string) =>
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status } : j));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Saved Jobs</h1>
        <p className="text-muted-foreground mt-1">{jobs.length} jobs saved · Track your applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, { label, color }]) => (
          <div key={key} className="bg-card rounded-xl border border-border/50 p-4 card-shadow text-center cursor-pointer hover:border-accent/30 transition-colors"
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}>
            <div className="font-heading text-2xl font-bold text-foreground">
              {jobs.filter((j) => j.status === key).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search saved jobs..." className="pl-9" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="font-heading font-semibold text-foreground">No saved jobs yet</p>
          <p className="text-muted-foreground text-sm mt-1">Browse the job board and save jobs you're interested in</p>
          <Button className="mt-4 gap-2" onClick={() => navigate("/jobs")}>
            <Briefcase className="h-4 w-4" /> Browse Jobs in {city.name}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const status = statusConfig[job.status as keyof typeof statusConfig];
            return (
              <Card key={job.id} className="card-shadow hover:card-shadow-hover transition-all border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-foreground">{job.title}</h3>
                        <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">{job.matchScore}% match</Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-accent font-medium text-sm">{job.company}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{job.location}</span>
                        <span>{job.type}</span>
                        <span className="font-medium text-foreground">₹{job.salaryMin}L – ₹{job.salaryMax}L</span>
                        <span>Saved {job.savedDate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => removeJob(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                          <ExternalLink className="h-3 w-3" /> View
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Status updater */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                    <span className="text-xs text-muted-foreground shrink-0">Update status:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <button key={key} onClick={() => updateStatus(job.id, key)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            job.status === key
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted-foreground hover:border-accent/50"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
