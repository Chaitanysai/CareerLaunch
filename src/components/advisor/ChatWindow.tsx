import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
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

const cleanText = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");

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

    const assistantIdx = history.length;
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    await streamChatWithAdvisor(
      history, city.name, skills, jobTitle,
      (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = { ...updated[assistantIdx], content: updated[assistantIdx].content + chunk };
          return updated;
        });
      },
      () => setLoading(false),
      (errMsg) => {
        setApiError(errMsg);
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = { role: "assistant", content: "Sorry, I couldn't connect right now. Please try again." };
          return updated;
        });
        setLoading(false);
      }
    );
    inputRef.current?.focus();
  };

  return (
    <div className={cn(
      "flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border",
      compact ? "h-[520px]" : "h-[calc(100vh-8rem)]"
    )}
      style={{ borderColor: "var(--outline-variant)" }}>

      {/* ── Header — FIX 3: dark bg with clearly readable white text ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 shrink-0"
        style={{ background: "var(--primary)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.18)" }}>
          <Sparkles className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <div className="flex-1 min-w-0">
          {/* FIX: explicit white color, not relying on inheritance */}
          <p className="font-bold text-sm leading-tight" style={{ fontFamily: "var(--font-headline)", color: "#ffffff" }}>
            AI Career Advisor
          </p>
          <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.70)" }}>
            Specialized for {city.name} market
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>Online</span>
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-2 px-4 py-2.5 text-xs shrink-0"
          style={{ background: "#fee2e2", color: "#991b1b", borderBottom: "1px solid #fecaca" }}>
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ background: "var(--surface-container-low)" }}>
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              msg.role === "assistant" ? "" : ""
            )}
              style={{
                background: msg.role === "assistant" ? "var(--surface-container)" : "var(--primary)",
              }}>
              {msg.role === "assistant"
                ? <Bot className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                : <User className="h-3.5 w-3.5 text-white" />}
            </div>

            <div className={cn(
              "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              msg.role === "assistant"
                ? "rounded-tl-sm"
                : "rounded-tr-sm"
            )}
              style={{
                background: msg.role === "assistant"
                  ? "var(--surface-container-lowest)"
                  : "var(--primary)",
                color: msg.role === "assistant"
                  ? "var(--on-surface)"
                  : "#ffffff",
                boxShadow: "0 1px 3px rgba(25,28,30,0.08)",
              }}>
              {msg.content === "" && loading && i === messages.length - 1 ? (
                <div className="flex items-center gap-1 py-1">
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--outline)" }} />
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--outline)" }} />
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--outline)" }} />
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{cleanText(msg.content)}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0"
          style={{ background: "var(--surface-container-low)" }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: "var(--surface-container-lowest)",
                borderColor: "var(--outline-variant)",
                color: "var(--on-surface-variant)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                (e.currentTarget as HTMLElement).style.color = "var(--primary)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--outline-variant)";
                (e.currentTarget as HTMLElement).style.color = "var(--on-surface-variant)";
              }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 shrink-0 border-t"
        style={{ background: "white", borderColor: "var(--outline-variant)" }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask about ${city.name} job market...`}
            disabled={loading}
            className="flex-1 text-sm px-4 py-2.5 rounded-xl outline-none border transition-all"
            style={{
              background: "var(--surface-container-low)",
              borderColor: "var(--outline-variant)",
              color: "var(--on-surface)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--outline-variant)"}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: input.trim() && !loading ? "var(--primary)" : "var(--surface-container-high)",
              color: input.trim() && !loading ? "white" : "var(--outline)",
            }}>
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
