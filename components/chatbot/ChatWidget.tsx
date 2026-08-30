"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";

type LocalMessage = { role: "visitor" | "assistant"; content: string };

type LeadFormState = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  productInterest: string;
  quantity: string;
  country: string;
};

const EMPTY_LEAD_FORM: LeadFormState = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  productInterest: "",
  quantity: "",
  country: "",
};

const DEFAULT_QUICK_ACTIONS = [
  "What products do you offer?",
  "Do you export to Germany?",
  "Can I request a quotation?",
  "How can I contact sales?",
];

const FALLBACK_REPLY = "Sorry, I'm having trouble responding right now. Please try again in a moment.";
const DEFAULT_PROACTIVE_FOLLOW_UP = "Are you looking for a specific product or service?";
const PROACTIVE_SHOWN_KEY = "ge_chat_proactive_shown";

export default function ChatWidget({
  companyId,
  assistantName = "AI Assistant",
  greeting = "Hello! How can I help you today?",
  themeColor = "#4f46e5",
  quickActions = DEFAULT_QUICK_ACTIONS,
  proactiveFollowUp = DEFAULT_PROACTIVE_FOLLOW_UP,
  proactiveDelayMs = 8000,
}: {
  companyId?: string;
  assistantName?: string;
  greeting?: string;
  themeColor?: string;
  quickActions?: string[];
  proactiveFollowUp?: string;
  proactiveDelayMs?: number;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormState>(EMPTY_LEAD_FORM);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const historyFetched = useRef(false);
  const leadFormShown = useRef(false);
  const engaged = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const gradient = `linear-gradient(135deg, ${themeColor}, color-mix(in srgb, ${themeColor} 45%, #ffffff))`;

 
  useEffect(() => {
    const key = "ge_chat_visitor_id";
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
    }
    setVisitorId(id);
  }, []);

  
  useEffect(() => {
    window.parent?.postMessage({ type: "ge-chat-resize", open }, "*");
  }, [open]);

  
  useEffect(() => {
    if (!open || !companyId || !visitorId || historyFetched.current) return;
    historyFetched.current = true;

    fetch(`/api/chatbot/history?companyId=${encodeURIComponent(companyId)}&visitorId=${encodeURIComponent(visitorId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversationId) setConversationId(data.conversationId);
        if (Array.isArray(data.messages) && data.messages.length > 0) setMessages(data.messages);
      })
      .catch(() => {});
  }, [open, companyId, visitorId]);

  
  
  useEffect(() => {
    if (!companyId || !visitorId) return;
    if (window.localStorage.getItem(PROACTIVE_SHOWN_KEY) === "true") return;

    const timer = setTimeout(async () => {
      if (engaged.current) return;
      engaged.current = true;

      try {
        const res = await fetch("/api/chatbot/proactive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, visitorId, greeting, followUp: proactiveFollowUp }),
        });
        const data = await res.json();
        if (data.skipped || !Array.isArray(data.messages) || data.messages.length === 0) return;

        
        window.localStorage.setItem(PROACTIVE_SHOWN_KEY, "true");

        historyFetched.current = true;
        if (data.conversationId) setConversationId(data.conversationId);
        setOpen(true);
        setMessages([data.messages[0]]);

        if (data.messages[1]) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [...prev, data.messages[1]]);
          }, 1200);
        }
      } catch {
       
      }
    }, proactiveDelayMs);

    return () => clearTimeout(timer);
  }, [companyId, visitorId, greeting, proactiveFollowUp, proactiveDelayMs]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "visitor", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, visitorId, conversationId, message: trimmed }),
      });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || FALLBACK_REPLY }]);
      if ((data.qualifiedLead || data.needsFallback) && !leadFormShown.current) {
        leadFormShown.current = true;
        setShowLeadForm(true);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: FALLBACK_REPLY }]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleLeadSubmit(e: FormEvent) {
    e.preventDefault();
    if (!conversationId) return;
    setLeadSubmitting(true);
    setLeadError(null);

    try {
      const res = await fetch("/api/chatbot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, conversationId, ...leadForm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLeadError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setShowLeadForm(false);
      setLeadForm(EMPTY_LEAD_FORM);
      setMessages((prev) => [...prev, { role: "assistant", content: data.confirmationMessage }]);
    } catch {
      setLeadError("Something went wrong. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendText(input);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[1000] flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 text-white" style={{ backgroundImage: gradient }}>
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles size={18} />
              <span>{assistantName}</span>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full text-white" style={{ backgroundImage: gradient }}>
                  <Sparkles size={26} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Hello!</h3>
                <p className="mt-1 text-neutral-500">{greeting}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {quickActions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendText(q)}
                      className="rounded-full border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "visitor" ? "self-end" : "self-start"}>
                    <div
                      className={
                        m.role === "visitor"
                          ? "rounded-2xl rounded-br-sm px-4 py-2 text-white"
                          : "rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-2 text-neutral-800"
                      }
                      style={m.role === "visitor" ? { backgroundImage: gradient } : undefined}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="self-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                {showLeadForm && (
                  <form onSubmit={handleLeadSubmit} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-neutral-800">
                      Share your details and our team will follow up
                    </p>
                    <div className="space-y-2">
                      <input
                        required
                        placeholder="Name*"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email*"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                      />
                      <input
                        required
                        placeholder="Phone*"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                      />
                      <input
                        placeholder="Company (optional)"
                        value={leadForm.companyName}
                        onChange={(e) => setLeadForm((f) => ({ ...f, companyName: e.target.value }))}
                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                      />
                      <input
                        placeholder="Product of interest (optional)"
                        value={leadForm.productInterest}
                        onChange={(e) => setLeadForm((f) => ({ ...f, productInterest: e.target.value }))}
                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Quantity (optional)"
                          value={leadForm.quantity}
                          onChange={(e) => setLeadForm((f) => ({ ...f, quantity: e.target.value }))}
                          className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                        />
                        <input
                          placeholder="Country (optional)"
                          value={leadForm.country}
                          onChange={(e) => setLeadForm((f) => ({ ...f, country: e.target.value }))}
                          className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                        />
                      </div>
                    </div>
                    {leadError && <p className="mt-2 text-xs text-red-600">{leadError}</p>}
                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundImage: gradient }}
                    >
                      {leadSubmitting ? "Sending…" : "Send my details"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-neutral-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="h-11 flex-1 rounded-full border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
              className="grid h-11 w-11 place-items-center rounded-full text-white disabled:opacity-40"
              style={{ backgroundImage: gradient }}
            >
              <ArrowUp size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close chat" : "Chat with us"}
        onClick={() => {
          engaged.current = true;
          setOpen((v) => !v);
        }}
        className="fixed bottom-5 right-5 z-[1000] grid h-[60px] w-[60px] place-items-center rounded-full text-white"
        style={{ backgroundImage: gradient, boxShadow: "0 0 32px 6px rgba(99,102,241,.35), 0 4px 16px rgba(0,0,0,.25)" }}
      >
        {open ? <X size={22} /> : <Sparkles size={24} />}
      </button>
    </>
  );
}
