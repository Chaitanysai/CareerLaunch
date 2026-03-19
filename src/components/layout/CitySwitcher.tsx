import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { useCity } from "@/hooks/useCity";
import { INDIAN_CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";

interface CitySwitcherProps {
  variant?: "navbar" | "sidebar" | "landing";
}

const CitySwitcher = ({ variant = "navbar" }: CitySwitcherProps) => {
  const { city, setCity } = useCity();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = INDIAN_CITIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const isSidebar = variant === "sidebar";
  const isLanding = variant === "landing";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-all",
          isSidebar && "w-full px-3 py-2 text-sm hover:bg-white/5 text-[var(--sidebar-text)]",
          !isSidebar && !isLanding && "px-3 py-1.5 text-sm border border-border/60 hover:border-accent/50 bg-background/50 text-foreground",
          isLanding && "px-4 py-2.5 text-sm border border-white/20 bg-white/10 text-white hover:bg-white/15 backdrop-blur-sm rounded-xl"
        )}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium truncate max-w-[120px]">{city.name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Cities */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCity(c); setOpen(false); setSearch(""); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left",
                  city.id === c.id && "bg-accent/10 text-accent"
                )}
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.state}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-accent">
                    {c.jobsCount >= 1000 ? `${(c.jobsCount / 1000).toFixed(0)}K` : c.jobsCount}+ jobs
                  </div>
                  <div className="text-xs text-muted-foreground">avg ₹{c.avgSalaryLPA}L</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySwitcher;
