import { useState } from "react";
import { BookmarkCheck, Trash2, ExternalLink, Search, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useCity } from "@/hooks/useCity";

interface SavedJob {
  id: string;
  title: string; company: string; location: string;
  type: string; salaryMin: number; salaryMax: number;
  matchScore: number; skills: string[]; url: string;
  savedDate: string; status: string;
}

const statusConfig = {
  saved:     { label: "Saved",     color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  applied:   { label: "Applied",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  interview: { label: "Interview", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  offer:     { label: "Offer 🎉",  color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  rejected:  { label: "Rejected",  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const uid = () => Math.random().toString(36).slice(2, 9);

const SavedJobs = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", location: city.name, type: "Full-time", salaryMin: "", salaryMax: "", url: "", status: "saved" });

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
      && (statusFilter === "all" || j.status === statusFilter);
  });

  const addJob = () => {
    if (!form.title || !form.company) return;
    setJobs([...jobs, { id: uid(), ...form, matchScore: 0, skills: [], savedDate: "Today", salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0 }]);
    setAddOpen(false);
    setForm({ title: "", company: "", location: city.name, type: "Full-time", salaryMin: "", salaryMax: "", url: "", status: "saved" });
  };

  const removeJob = (id: string) => setJobs((prev) => prev.filter((j) => j.id !== id));
  const updateStatus = (id: string, status: string) => setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status } : j));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Saved Jobs</h1>
          <p className="text-muted-foreground mt-1">{jobs.length > 0 ? `${jobs.length} jobs saved · Track your applications` : "Save jobs you're interested in"}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="h-4 w-4" />Add Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        /* ── Empty state ── */
        <div className="card-premium p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <BookmarkCheck className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">No saved jobs yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            Save jobs from the Job Board to track your applications here, or add them manually.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/jobs")} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
              <Briefcase className="h-4 w-4" />Browse Jobs in {city.name}
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />Add Manually
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {Object.entries(statusConfig).map(([key, { label, color }]) => (
              <div key={key} className="card-premium p-4 text-center cursor-pointer hover:border-emerald-300 transition-colors"
                onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}>
                <div className="font-heading text-2xl font-bold text-foreground">{jobs.filter((j) => j.status === key).length}</div>
                <Badge className={`text-xs mt-1 border-0 ${color}`}>{label}</Badge>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search saved jobs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([k, { label }]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Jobs */}
          <div className="space-y-3">
            {filtered.map((job) => {
              const status = statusConfig[job.status as keyof typeof statusConfig];
              return (
                <Card key={job.id} className="card-premium hover:border-emerald-200 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                        </div>
                        <p className="text-emerald-600 font-medium text-sm">{job.company}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {job.location && <span>{job.location}</span>}
                          {job.type && <span>{job.type}</span>}
                          {job.salaryMin > 0 && <span className="font-medium text-foreground">₹{job.salaryMin}L – ₹{job.salaryMax}L</span>}
                          <span>Saved {job.savedDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {job.url && job.url !== "#" && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"><ExternalLink className="h-3 w-3" />View</Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeJob(job.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground mr-1">Move to:</span>
                      {Object.entries(statusConfig).filter(([k]) => k !== job.status).map(([key, { label }]) => (
                        <button key={key} onClick={() => updateStatus(job.id, key)}
                          className="text-xs px-2 py-1 rounded-full border border-border hover:border-emerald-400 hover:text-emerald-600 transition-all text-muted-foreground">
                          {label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Saved Job</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Company *</Label><Input placeholder="e.g. Flipkart" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Role *</Label><Input placeholder="e.g. Senior Engineer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Location</Label><Input placeholder={city.name} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Job URL</Label><Input placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Min Salary (LPA)</Label><Input type="number" placeholder="18" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Max Salary (LPA)</Label><Input type="number" placeholder="28" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addJob} className="bg-emerald-500 hover:bg-emerald-600 text-white">Add Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedJobs;
