import { useState } from "react";
import { MessageSquare, X, Minimize2 } from "lucide-react";
import ChatWindow from "./ChatWindow";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  skills?: string[];
  jobTitle?: string;
}

const ChatBubble = ({ skills = [], jobTitle = "" }: ChatBubbleProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Don't show bubble on the full advisor page
  if (location.pathname === "/advisor") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className="bubble-in w-[360px] shadow-2xl">
          <div className="relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Minimize2 className="h-3.5 w-3.5 text-white" />
            </button>
            <ChatWindow skills={skills} jobTitle={jobTitle} compact />
          </div>
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105",
          open ? "bg-muted text-foreground border border-border" : "text-white"
        )}
        style={!open ? { background: "var(--sidebar-bg)", border: "2px solid var(--accent-500)" } : {}}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
          </div>
        )}
      </button>

      {/* Tooltip — only when closed */}
      {!open && (
        <div className="absolute bottom-16 right-0 bg-foreground text-background text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
          AI Career Advisor
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
