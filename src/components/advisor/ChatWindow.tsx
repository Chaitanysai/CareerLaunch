import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { streamChatWithAdvisor, ChatMessage } from "@/services/groq";
import { useCity } from "@/hooks/useCity";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  skills?: string[];
  jobTitle?: string;
  compact?: boolean;
}

const QUICK_PROMPTS = [
  "What skills are in demand in my city?",
  "How should I negotiate salary?",
  "Help me prepare for interviews",
  "What's a good resume format for India?",
];

const ChatWindow = ({ skills = [], jobTitle = "", compact = false }: ChatWindowProps) => {
  const { city } = useCity();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm your RoleMatch AI Career Advisor. I specialize in the **${city.name}** job market${jobTitle ? ` for ${jobTitle} roles` : ""}.\n\nAsk me anything about careers, salaries, interviews, or skills! 🚀`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    // Add empty assistant message for streaming
    const assistantIdx = newMessages.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await streamChatWithAdvisor(
        newMessages,
        city.name,
        skills,
        jobTitle,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = {
              ...updated[assistantIdx],
              content: updated[assistantIdx].content + chunk,
            };
            return updated;
          });
        },
        () => setLoading(false)
      );
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: "assistant",
          content: "Sorry, I couldn't connect right now. Please try again.",
        };
        return updated;
      });
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden",
      compact ? "h-[480px]" : "h-[calc(100vh-8rem)]")}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50"
        style={{ background: "var(--sidebar-bg)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent-500)" }}>
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-heading font-semibold text-sm text-white">AI Career Advisor</p>
          <p className="text-xs" style={{ color: "var(--sidebar-text)", opacity: 0.7 }}>
            Specialized for {city.name} market
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-accent-green font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              msg.role === "assistant"
                ? "bg-accent/10 border border-accent/20"
                : "bg-primary text-primary-foreground"
            )}>
              {msg.role === "assistant"
                ? <Bot className="h-3.5 w-3.5 text-accent" />
                : <User className="h-3.5 w-3.5" />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-muted text-foreground rounded-tl-sm"
                : "bg-primary text-primary-foreground rounded-tr-sm"
            )}>
              {msg.content === "" && loading && i === messages.length - 1 ? (
                <div className="flex items-center gap-1 py-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only on first load */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent/50 hover:bg-accent/5 text-muted-foreground hover:text-accent transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask about ${city.name} job market...`}
            className="flex-1 text-sm"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
