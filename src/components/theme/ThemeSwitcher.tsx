import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemePalette, applyTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<ThemePalette | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        // Revert preview if closed without selecting
        applyTheme(theme);
        setHovered(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [theme]);

  const handleHover = (t: ThemePalette) => {
    setHovered(t);
    applyTheme(t); // live preview
  };

  const handleLeave = () => {
    setHovered(null);
    applyTheme(theme); // revert to current
  };

  const handleSelect = (t: ThemePalette) => {
    setTheme(t);
    setHovered(null);
    setOpen(false);
  };

  const active = hovered || theme;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-semibold"
        style={{
          background: open ? "var(--surface-container)" : "transparent",
          color: "var(--on-surface-variant)",
          fontFamily: "var(--font-headline)",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-container)"}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        title="Change theme color"
      >
        {/* Color dot */}
        <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-all"
          style={{ background: theme.primary }} />
        <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
          palette
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden bubble-in"
          style={{
            background: "var(--surface-container-lowest)",
            boxShadow: "0 20px 48px rgba(25,28,30,0.16), 0 4px 12px rgba(25,28,30,0.08)",
            width: 280,
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--surface-container-low)" }}>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--on-surface)" }}>
                Theme Color
              </p>
              <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                Live preview on hover
              </p>
            </div>
            {/* Preview swatch */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: active.primary, fontFamily: "var(--font-headline)" }}>
              {active.emoji} {active.name}
            </div>
          </div>

          {/* Color grid */}
          <div className="p-4 grid grid-cols-5 gap-2.5">
            {themes.map(t => {
              const isActive = theme.id === t.id;
              const isHovered = hovered?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  onMouseEnter={() => handleHover(t)}
                  onMouseLeave={handleLeave}
                  title={`${t.emoji} ${t.name}`}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center relative"
                    style={{
                      background: t.primary,
                      transform: isHovered ? "scale(1.18)" : isActive ? "scale(1.08)" : "scale(1)",
                      boxShadow: isHovered
                        ? `0 4px 16px ${t.primary}60`
                        : isActive
                          ? `0 2px 8px ${t.primary}40`
                          : "none",
                    }}
                  >
                    {isActive && (
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    )}
                    {!isActive && (
                      <span className="text-base" style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.15s" }}>
                        {t.emoji}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold"
                    style={{ color: isActive || isHovered ? "var(--on-surface)" : "var(--outline)", fontFamily: "var(--font-label)" }}>
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 text-xs text-center"
            style={{ borderTop: "1px solid var(--surface-container-low)", color: "var(--outline)" }}>
            Hover to preview · Click to apply
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
