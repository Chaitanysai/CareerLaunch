import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, BookmarkCheck, User,
  MessageSquare, TrendingUp, Sparkles, Upload, LogOut,
  Mic, FileText, Building2, Map, Linkedin, Kanban,
  FileEdit, DollarSign, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CitySwitcher from "./CitySwitcher";

const NAV_GROUPS = [
  {
    items: [
      { label: "Dashboard",      href: "/dashboard",       icon: LayoutDashboard },
      { label: "Job Board",      href: "/jobs",            icon: Briefcase },
      { label: "Resume Matcher", href: "/match",           icon: Upload },
      { label: "Skill Gap",      href: "/skillgap",        icon: TrendingUp },
      { label: "AI Advisor",     href: "/advisor",         icon: MessageSquare },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Interview Prep",   href: "/interview",       icon: Mic },
      { label: "Resume Builder",   href: "/resume-builder",  icon: FileText },
      { label: "Cover Letter",     href: "/cover-letter",    icon: FileEdit },
      { label: "Salary Coach",     href: "/salary-coach",    icon: DollarSign },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Company Research", href: "/company-research", icon: Building2 },
      { label: "Career Roadmap",   href: "/career-roadmap",  icon: Map },
      { label: "LinkedIn",         href: "/linkedin",         icon: Linkedin },
      { label: "Job Tracker",      href: "/tracker",          icon: Kanban },
    ],
  },
  {
    items: [
      { label: "Saved Jobs",  href: "/saved",   icon: BookmarkCheck },
      { label: "My Profile",  href: "/profile", icon: User },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (href: string) => location.pathname === href;

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col items-center py-4 gap-1"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo mark */}
      <Link to="/dashboard" className="mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#22c55e" }}>
          <Sparkles className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-3 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={cn("flex flex-col items-center gap-0.5 w-full", gi > 0 && "mt-2 pt-2 border-t")}
            style={{ borderColor: "var(--sidebar-border)" }}>
            {group.items.map(({ label, href, icon: Icon }) => (
              <Link key={href} to={href} className="w-full flex justify-center">
                <div className={cn("sidebar-icon-btn", isActive(href) && "active")}>
                  <Icon style={{ width: 18, height: 18 }} />
                  <span className="tooltip">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: city + user + signout */}
      <div className="flex flex-col items-center gap-2 mt-2 px-3 w-full border-t pt-3"
        style={{ borderColor: "var(--sidebar-border)" }}>
        {/* User avatar */}
        <div className="sidebar-icon-btn">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs font-semibold"
              style={{ background: "#22c55e", color: "#fff" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="tooltip">{user?.name}</span>
        </div>
        {/* Sign out */}
        <button className="sidebar-icon-btn" onClick={signOut}>
          <LogOut style={{ width: 16, height: 16 }} />
          <span className="tooltip">Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
