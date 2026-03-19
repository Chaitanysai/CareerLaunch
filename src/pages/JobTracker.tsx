import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, MapPin, DollarSign, ExternalLink, Trash2, GripVertical, Calendar, StickyNote } from "lucide-react";

interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  appliedDate: string;
  url: string;
  notes: string;
  status: "wishlist" | "applied" | "interview" | "offer" | "rejected";
}

const COLUMNS = [
  { id: "wishlist", label: "Wishlist", color: "border-gray-300", badge: "bg-gray-100 text-gray-600" },
  { id: "applied", label: "Applied", color: "border-blue-300", badge: "bg-blue-100 text-blue-700" },
  { id: "interview", label: "Interview", color: "border-amber-300", badge: "bg-amber-100 text-amber-700" },
  { id: "offer", label: "Offer 🎉", color: "border-green-300", badge: "bg-green-100 text-green-700" },
  { id: "rejected", label: "Rejected", color: "border-red-300", badge: "bg-red-100 text-red-600" },
];

const SAMPLE: Application[] = [
  { id: "1", company: "Flipkart", role: "Senior Frontend Engineer", location: "Bengaluru", salaryMin: 22, salaryMax: 35, appliedDate: "2024-01-15", url: "#", notes: "Applied via LinkedIn. Referral from Rahul.", status: "interview" },
  { id: "2", company: "Razorpay", role: "React Developer", location: "Bengaluru", salaryMin: 18, salaryMax: 28, appliedDate: "2024-01-18", url: "#", notes: "Applied via Naukri.", status: "applied" },
  { id: "3", company: "CRED", role: "UI Engineer", location: "Bengaluru", salaryMin: 20, salaryMax: 32, appliedDate: "", url: "#", notes: "Dream company! Check Instahyre.", status: "wishlist" },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const JobTracker = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>(SAMPLE);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "", role: "", location: "", salaryMin: "", salaryMax: "",
    appliedDate: "", url: "", notes: "", status: "applied" as Application["status"],
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addApp = () => {
    if (!form.company || !form.role) {
      toast({ title: "Enter company and role", variant: "destructive" });
      return;
    }
    const newApp: Application = {
      id: uid(), company: form.company, role: form.role, location: form.location,
      salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0,
      appliedDate: form.appliedDate, url: form.url, notes: form.notes, status: form.status,
    };
    setApps([...apps, newApp]);
    setModalOpen(false);
    setForm({ company: "", role: "", location: "", salaryMin: "", salaryMax: "", appliedDate: "", url: "", notes: "", status: "applied" });
    toast({ title: "Application added!" });
  };

  const moveApp = (id: string, newStatus: Application["status"]) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
  };

  const deleteApp = (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    setDetailApp(null);
    toast({ title: "Removed" });
  };

  const handleDrop = (e: React.DragEvent, status: Application["status"]) => {
    e.preventDefault();
    if (dragId) { moveApp(dragId, status); setDragId(null); }
  };

  const stats = COLUMNS.map((c) => ({ ...c, count: apps.filter((a) => a.status === c.id).length }));

  return (
    <DashboardLayout title="Job Tracker">
      <div className="px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Job Application Tracker</h1>
            <p className="text-muted-foreground mt-1">Track all your applications in one place — drag to update status</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />Add Application
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {stats.map(({ id, label, badge, count }) => (
            <div key={id} className="text-center bg-card border border-border/50 rounded-xl p-3 card-shadow">
              <div className="font-heading text-2xl font-bold text-foreground">{count}</div>
              <Badge className={`text-xs mt-1 ${badge}`}>{label}</Badge>
            </div>
          ))}
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {COLUMNS.map((col) => {
            const colApps = apps.filter((a) => a.status === col.id);
            return (
              <div key={col.id} className="min-w-[220px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id as Application["status"])}>
                <div className={`rounded-xl border-2 ${col.color} bg-muted/30 min-h-[400px] p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading font-semibold text-sm text-foreground">{col.label}</span>
                    <Badge className={`text-xs ${col.badge}`}>{colApps.length}</Badge>
                  </div>

                  <div className="space-y-2.5">
                    {colApps.map((app) => (
                      <div key={app.id}
                        draggable
                        onDragStart={() => setDragId(app.id)}
                        onClick={() => setDetailApp(app)}
                        className="bg-card rounded-xl p-3 border border-border/50 cursor-pointer hover:border-accent/30 hover:card-shadow-hover transition-all group">
                        <div className="flex items-start justify-between mb-1">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex-1 ml-1 min-w-0">
                            <p className="font-medium text-xs text-foreground leading-tight truncate">{app.role}</p>
                            <p className="text-xs text-accent font-medium mt-0.5">{app.company}</p>
                          </div>
                        </div>
                        {app.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                            <MapPin className="h-2.5 w-2.5" />{app.location}
                          </p>
                        )}
                        {(app.salaryMin > 0 || app.salaryMax > 0) && (
                          <p className="text-xs font-medium text-foreground flex items-center gap-1 mt-1">
                            <DollarSign className="h-2.5 w-2.5" />₹{app.salaryMin}L – ₹{app.salaryMax}L
                          </p>
                        )}
                        {app.appliedDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-2.5 w-2.5" />{app.appliedDate}
                          </p>
                        )}
                        {app.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1 line-clamp-2">
                            <StickyNote className="h-2.5 w-2.5 mt-0.5 shrink-0" />{app.notes}
                          </p>
                        )}
                      </div>
                    ))}
                    {colApps.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground/40">
                        <Briefcase className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-xs">Drop here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Add Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Company *</Label>
                  <Input placeholder="Flipkart" value={form.company} onChange={(e) => update("company", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role *</Label>
                  <Input placeholder="Senior Engineer" value={form.role} onChange={(e) => update("role", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Location</Label>
                  <Input placeholder="Bengaluru" value={form.location} onChange={(e) => update("location", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLUMNS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Min Salary (LPA)</Label>
                  <Input placeholder="18" type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Salary (LPA)</Label>
                  <Input placeholder="28" type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Applied Date</Label>
                  <Input type="date" value={form.appliedDate} onChange={(e) => update("appliedDate", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Job URL</Label>
                  <Input placeholder="https://..." value={form.url} onChange={(e) => update("url", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea placeholder="Recruiter name, referral, follow-up date..." rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={addApp}>Add Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail dialog */}
        {detailApp && (
          <Dialog open={!!detailApp} onOpenChange={() => setDetailApp(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">{detailApp.role}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-accent font-semibold">{detailApp.company}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {detailApp.location && <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{detailApp.location}</p>}
                  {(detailApp.salaryMin > 0) && <p className="flex items-center gap-1 font-medium"><DollarSign className="h-3.5 w-3.5" />₹{detailApp.salaryMin}L – ₹{detailApp.salaryMax}L</p>}
                  {detailApp.appliedDate && <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{detailApp.appliedDate}</p>}
                </div>
                {detailApp.notes && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Notes</p>
                    {detailApp.notes}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Move to:</p>
                  <div className="flex flex-wrap gap-2">
                    {COLUMNS.filter((c) => c.id !== detailApp.status).map((c) => (
                      <button key={c.id}
                        onClick={() => { moveApp(detailApp.id, c.id as Application["status"]); setDetailApp(null); }}
                        className={`text-xs px-3 py-1.5 rounded-full border ${c.badge} transition-all hover:opacity-80`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                {detailApp.url && detailApp.url !== "#" && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={detailApp.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />View Job
                    </a>
                  </Button>
                )}
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => deleteApp(detailApp.id)}>
                  <Trash2 className="h-3.5 w-3.5" />Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobTracker;
