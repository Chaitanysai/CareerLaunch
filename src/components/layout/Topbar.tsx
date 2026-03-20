import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CitySwitcher from "./CitySwitcher";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

const NOTIFICATIONS = [
  { id: 1, icon: "work",              color: "var(--primary)", title: "New job match!",        body: "Senior React Developer at Swiggy — 94% match",        time: "2m",  read: false },
  { id: 2, icon: "analytics",         color: "#3b82f6",         title: "Skill gap update",      body: "TypeScript is top demand in Hyderabad right now",      time: "1h",  read: false },
  { id: 3, icon: "psychology",        color: "#7c3aed",         title: "AI Advisor tip",        body: "Add certifications to boost your profile score",        time: "3h",  read: false },
  { id: 4, icon: "workspace_premium", color: "#d97706",         title: "Profile milestone",     body: "70+ job matches — you're on a streak!",                time: "1d",  read: true  },
  { id: 5, icon: "work",              color: "var(--primary)",  title: "Job alert",             body: "Razorpay is hiring Full Stack Engineers in Bengaluru",  time: "2d",  read: true  },
];

const Topbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [search, setSearch] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/jobs?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="topbar-glass sticky top-0 z-30 flex items-center justify-between px-8 py-3">

      {onMenuClick && (
        <button onClick={onMenuClick} className="md:hidden mr-3 p-2 rounded-xl"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
          <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>menu</span>
        </button>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2"
            style={{ fontSize: 18, color: "var(--outline)" }}>search</span>
          <input className="search-s" style={{ paddingLeft: "2.75rem" }}
            placeholder="Search roles, skills, or companies..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-6">
        {/* City */}
        <div className="flex items-center gap-1.5 font-bold text-sm px-3 py-2 rounded-xl"
          style={{ fontFamily: "var(--font-headline)", color: "var(--primary)" }}>
          <CitySwitcher variant="navbar" />
        </div>

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-full transition-colors relative"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container)"}
            onMouseLeave={e => { if (!notifOpen) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>notifications</span>
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--error)" }} />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl z-50 overflow-hidden bubble-in"
              style={{ background: "var(--surface-container-lowest)", boxShadow: "0 16px 48px rgba(25,28,30,0.14)" }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--surface-container-low)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                      style={{ background: "var(--error)" }}>{unread} new</span>
                  )}
                </div>
                <button onClick={markAll} className="text-xs font-bold" style={{ color: "var(--primary)" }}>Mark all read</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifs.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ background: n.read ? "transparent" : "rgba(0,0,0,0.02)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container-low)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? "transparent" : "rgba(0,0,0,0.02)"}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${n.color}18` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: n.color }}>{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold" style={{ color: n.read ? "var(--on-surface-variant)" : "var(--on-surface)", fontFamily: "var(--font-headline)" }}>
                          {n.title}
                        </p>
                        <span className="text-[10px] shrink-0" style={{ color: "var(--outline)" }}>{n.time}</span>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: "var(--on-surface-variant)" }}>
                        {n.body}
                      </p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--primary)" }} />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid var(--surface-container-low)" }}>
                <button className="text-xs font-bold" style={{ color: "var(--primary)" }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 rounded-full transition-colors"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
          <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>settings</span>
        </button>

        {/* Avatar */}
        <button onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all"
          style={{ borderColor: "white", boxShadow: "0 1px 4px rgba(25,28,30,0.15)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--primary-container)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "white"}>
          <Avatar className="h-full w-full">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs font-bold text-white"
              style={{ background: "var(--primary)", fontFamily: "var(--font-headline)" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
