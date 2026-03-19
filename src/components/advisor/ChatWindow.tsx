import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, AlertCircle } from "lucide-react";
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
  "Best resume format for India?",
];

// Strip markdown bold (**text**) from AI responses
const cleanText = (text: string) => text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");

const ChatWindow = ({ skills = [], jobTitle = "", compact = false }: ChatWindowProps) => {
  const { city } = useCity();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm your RoleMatch AI Career Advisor, specialized for the ${city.name} job market${jobTitle ? ` — especially ${jobTitle} roles` : ""}.\n\nAsk me anything about careers, salaries, interviews, or skills!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setApiError(null);

    const userMsg: ChatMessage = { role: "user", content: userText };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    // Add empty assistant slot for streaming
    const assistantIdx = history.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await streamChatWithAdvisor(
      history,
      city.name,
      skills,
      jobTitle,
      // onChunk
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
      // onDone
      () => setLoading(false),
      // onError
      (errMsg) => {
        setApiError(errMsg);
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = {
            role: "assistant",
            content: "Sorry, I couldn't connect right now. Please check your API key and try again.",
          };
          return updated;
        });
        setLoading(false);
      }
    );

    inputRef.current?.focus();
  };

  return (
    <div className={cn(
      "flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden",
      compact ? "h-[480px]" : "h-[calc(100vh-8rem)]"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0"
        style={{ background: "var(--sidebar-bg)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-500)" }}>
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm text-white">AI Career Advisor</p>
          <p className="text-xs truncate" style={{ color: "var(--sidebar-text)", opacity: 0.7 }}>
            Specialized for {city.name} market
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="flex items-start gap-2 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive shrink-0">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              msg.role === "assistant"
                ? "border border-accent/20"
                : "bg-primary text-primary-foreground"
            )}
              style={msg.role === "assistant" ? { background: "rgba(0,200,150,0.1)" } : {}}>
              {msg.role === "assistant"
                ? <Bot className="h-3.5 w-3.5 text-accent" />
                : <User className="h-3.5 w-3.5" />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
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
                <span className="whitespace-pre-wrap">{cleanText(msg.content)}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only on first message */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent/50 hover:bg-accent/5 text-muted-foreground hover:text-accent transition-all">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/50 shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask about ${city.name} job market...`}
            className="flex-1 text-sm"
            disabled={loading}
          />
          <Button size="icon" onClick={() => sendMessage()}
            disabled={!input.trim() || loading} className="shrink-0">
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;