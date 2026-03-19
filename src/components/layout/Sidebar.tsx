import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, BookmarkCheck,
  User, MessageSquare, TrendingUp, Sparkles,
  ChevronRight, Upload, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CitySwitcher from "./CitySwitcher";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Job Board", href: "/jobs", icon: Briefcase },
  { label: "Saved Jobs", href: "/saved", icon: BookmarkCheck },
  { label: "Skill Gap", href: "/skillgap", icon: TrendingUp },
  { label: "AI Advisor", href: "/advisor", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-500)" }}>
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-white">
            Role<span style={{ color: "var(--accent-500)" }}>Match</span>
          </span>
        )}
      </div>

      {/* City switcher */}
      {!collapsed && (
        <div className="px-3 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <p className="text-xs px-1 mb-1.5" style={{ color: "var(--sidebar-text)", opacity: 0.5 }}>
            Current city
          </p>
          <CitySwitcher variant="sidebar" />
        </div>
      )}

      {/* Upload resume CTA */}
      {!collapsed && (
        <div className="px-3 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: "var(--accent-500)" }}
          >
            <Upload className="h-4 w-4 shrink-0" />
            Analyze Resume
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              to={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{
                background: active ? "var(--sidebar-active)" : "transparent",
                color: active ? "white" : "var(--sidebar-text)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-3 space-y-1" style={{ borderColor: "var(--sidebar-border)" }}>
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1"
            style={{ background: "var(--sidebar-hover)" }}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs font-bold"
                style={{ background: "var(--navy-600)", color: "white" }}>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--sidebar-text)", opacity: 0.6 }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "var(--sidebar-text)" }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
