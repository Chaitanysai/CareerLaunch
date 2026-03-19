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
    <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
      {/* Mobile menu */}
      {onMenuClick && (
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Page title */}
      {title && (
        <h1 className="font-heading font-semibold text-foreground text-base hidden sm:block">{title}</h1>
      )}

      <div className="flex-1" />

      {/* City switcher */}
      <CitySwitcher variant="navbar" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search jobs, skills..."
          className="pl-8 h-8 w-48 text-sm bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
      </Button>

      {/* Avatar */}
      <Avatar className="h-7 w-7 cursor-pointer">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
          {user?.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
};

export default Topbar;
