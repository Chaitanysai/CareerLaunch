import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCity } from "@/hooks/useCity";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string; company: string; role: string;
  location: string; salary: string; time: string;
  status: "wishlist" | "applied" | "interview" | "offer" | "rejected";
  notes?: string; round?: string;
}

const COLUMNS = [
  { id: "wishlist",  label: "Wishlist",   dot: "#94a3b8", count: 12 },
  { id: "applied",   label: "Applied",    dot: "#3b82f6", count: 28 },
  { id: "interview", label: "Interview",  dot: "#f59e0b", count: 5  },
  { id: "offer",     label: "Offer 🎉",   dot: "#22c55e", count: 2  },
  { id: "rejected",  label: "Rejected",   dot: "#ef4444", count: 4  },
];

const SAMPLE: Application[] = [
  { id: "1", company: "Google",     role: "Senior Product Designer",       location: "Hyderabad", salary: "₹ 45—60 LPA", time: "2d ago",       status: "wishlist" },
  { id: "2", company: "Zomato",     role: "Lead UI Architect",             location: "Remote",    salary: "₹ 55—72 LPA", time: "Applied 4h ago",status: "applied"  },
  { id: "3", company: "Razorpay",   role: "Full Stack Engineer",           location: "Bangalore", salary: "₹ 40—50 LPA", time: "Yesterday",     status: "applied"  },
  { id: "4", company: "CRED",       role: "Principal Experience Designer", location: "Mumbai",    salary: "₹ 80—95 LPA", time: "Tomorrow 2PM",  status: "interview", round: "Round 3: Portfolio Deep Dive" },
  { id: "5", company: "Microsoft",  role: "Senior UX Engineer",            location: "Hyderabad", salary: "₹ 65 LPA",    time: "Offer received",status: "offer",    notes: "Negotiation in progress. Counter-offered 70 LPA." },
  { id: "6", company: "Flipkart",   role: "Staff UI Engineer",             location: "Bengaluru", salary: "₹ 70—85 LPA", time: "Last week",     status: "rejected", notes: "Position filled internally. Re-evaluate in 6 months." },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const JobTracker = () => {
  const { city } = useCity();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>(SAMPLE);
  const [addOpen, setAddOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ company: "", role: "", location: city.name, salary: "", status: "wishlist" as Application["status"] });
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const stats = COLUMNS.map(c => ({ ...c, realCount: apps.filter(a => a.status === c.id).length }));

  const addApp = () => {
    if (!form.company || !form.role) { toast({ title: "Enter company and role", variant: "destructive" }); return; }
    setApps([...apps, { id: uid(), ...form, time: "Just now" }]);
    setAddOpen(false);
    setForm({ company: "", role: "", location: city.name, salary: "", status: "wishlist" });
    toast({ title: "Application added!" });
  };

  const moveApp = (id: string, status: Application["status"]) =>
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const handleDrop = (e: React.DragEvent, status: Application["status"]) => {
    e.preventDefault();
    if (dragId) { moveApp(dragId, status); setDragId(null); }
  };

  return (
    <DashboardLayout title="Job Tracker">
      <div className="p-8 min-h-screen" style={{ background: "var(--surface-container-low)" }}>
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
              Job Application Tracker
            </h2>
            <p className="max-w-md" style={{ color: "var(--on-surface-variant)" }}>
              Manage your active pursuits and visualize your career progression in real-time.
            </p>
          </div>
          <button className="btn-primary-s gap-2" onClick={() => setAddOpen(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            Add Application
          </button>
        </div>

        {/* Stats bar — from Stitch */}
        <div className="grid grid-cols-5 gap-6 mb-12">
          {stats.map(({ id, label, dot, realCount }) => (
            <div key={id} className="p-6 rounded-3xl" style={{ background: "var(--surface-container-low)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--on-surface-variant)" }}>{label}</p>
              <p className="font-bold text-3xl" style={{ fontFamily: "var(--font-headline)", color: id === "offer" ? "var(--secondary)" : id === "interview" ? "#d97706" : id === "rejected" ? "var(--error)" : "var(--on-surface)" }}>
                {String(realCount).padStart(2, "0")}
              </p>
            </div>
          ))}
        </div>

        {/* Kanban — from Stitch, horizontal scroll */}
        <div className="flex gap-6 items-start overflow-x-auto pb-8">
          {COLUMNS.map(col => {
            const colApps = apps.filter(a => a.status === col.id);
            return (
              <div key={col.id} className="min-w-[300px] rounded-3xl p-4"
                style={{ background: "var(--surface-container)" }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, col.id as Application["status"])}>
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                    <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-headline)", color: "#475569" }}>
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: "white", color: col.id === "applied" ? "#3b82f6" : col.id === "interview" ? "#f59e0b" : col.id === "offer" ? "#22c55e" : col.id === "rejected" ? "#ef4444" : "#64748b" }}>
                    {String(colApps.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="space-y-4">
                  {colApps.map(app => (
                    <div key={app.id}
                      draggable
                      onDragStart={() => setDragId(app.id)}
                      className="p-5 rounded-2xl cursor-grab active:cursor-grabbing group transition-all"
                      style={{
                        background: "var(--surface-container-lowest)",
                        boxShadow: "0 24px 24px -4px rgba(25,28,30,0.08)",
                        borderLeft: app.status === "interview" ? `4px solid ${col.dot}` : undefined,
                        opacity: app.status === "rejected" ? 0.65 : 1,
                      }}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-sm group-hover:opacity-70 transition-opacity"
                          style={{ color: "var(--outline-variant)" }}>drag_indicator</span>
                        {app.status === "interview" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: "#fef3c7", color: "#92400e" }}>
                            {app.time}
                          </span>
                        ) : app.status === "offer" ? (
                          <span className="material-symbols-outlined mat-fill" style={{ fontSize: 18, color: "var(--secondary)" }}>
                            verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold" style={{ color: "var(--outline)" }}>{app.time}</span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs uppercase mb-1" style={{ color: "var(--secondary)", fontFamily: "var(--font-headline)" }}>
                        {app.company}
                      </h4>
                      <p className="font-bold leading-tight mb-3" style={{ color: "var(--on-surface)", fontFamily: "var(--font-headline)" }}>
                        {app.role}
                      </p>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--on-surface-variant)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>location_on</span>
                          {app.location}
                        </div>
                        <div className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                          {app.salary}
                        </div>
                      </div>

                      {app.round && (
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--surface-container)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--outline)" }}>video_call</span>
                          <span className="text-[10px] font-medium" style={{ color: "var(--on-surface-variant)" }}>{app.round}</span>
                        </div>
                      )}
                      {app.notes && (
                        <div className="p-3 rounded-xl border mt-2" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#166534" }}>Status</p>
                          <p className="text-xs font-medium" style={{ color: "#14532d" }}>{app.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-8"
                      style={{ border: "2px dashed var(--outline-variant)", borderRadius: "1rem", color: "var(--outline)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 28, opacity: 0.4 }}>drag_pan</span>
                      <p className="text-xs mt-1">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="font-headline">Add Application</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              {[["Company *","company","Flipkart"],["Role *","role","Senior Engineer"],["Location","location",city.name],["Salary (LPA)","salary","₹ 28—42 LPA"]].map(([label,key,ph]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--on-surface-variant)" }}>{label}</label>
                  <input className="input-s" placeholder={ph} value={(form as any)[key]} onChange={e => u(key, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--on-surface-variant)" }}>Status</label>
                <select className="input-s cursor-pointer" value={form.status} onChange={e => u("status", e.target.value)}>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <button className="btn-ghost-s" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary-s" onClick={addApp}>Add Application</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* FAB */}
        <button onClick={() => setAddOpen(true)} className="fab-s fixed bottom-8 right-8 z-50">
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default JobTracker;
