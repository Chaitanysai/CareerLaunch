import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CitySwitcher from "./CitySwitcher";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopbarProps {
  onMenuClick?: () => void;
  title?: string;
}

const Topbar = ({ onMenuClick, title }: TopbarProps) => {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b bg-white/80 dark:bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-5 gap-3"
      style={{ borderColor: "hsl(var(--border))" }}>

      {/* Mobile menu */}
      {onMenuClick && (
        <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Title */}
      {title && (
        <h1 className="font-semibold text-sm text-foreground hidden sm:block tracking-tight">{title}</h1>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search anything..."
          className="pl-9 h-8 w-52 text-sm bg-muted/60 border-0 rounded-lg focus-visible:ring-1 focus-visible:bg-white"
        />
      </div>

      {/* City */}
      <CitySwitcher variant="navbar" />

      {/* Notifications */}
      <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </button>

      {/* Avatar */}
      <Avatar className="h-7 w-7 cursor-pointer ring-2 ring-border hover:ring-emerald-500 transition-all">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback className="text-xs font-bold bg-emerald-500 text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
};

export default Topbar;
