"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { clsx } from "clsx";

type Msg = { role: "guest" | "host"; text: string };

const SUGGESTIONS = ["What's in the Denali?", "Do you have anything vegetarian?", "What time does breakfast end?"];

/** Floating "ask about the menu" assistant backed by /api/ask (Gemini, grounded in the live menu). */
export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "host", text: "Hey! Ask me anything about the menu, prices, allergens or hours." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sessionRef = useRef<string>("");

  useEffect(() => {
    if (!sessionRef.current) sessionRef.current = Math.random().toString(36).slice(2, 12);
  }, []);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy || !open) return;
    setInput("");
    setMessages((m) => [...m, { role: "guest", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, sessionId: sessionRef.current }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      setMessages((m) => [...m, { role: "host", text: data.answer ?? data.error ?? "Sorry, something went wrong. Please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "host", text: "Looks like we lost the connection. Please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="ask-panel"
        className="fixed bottom-24 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-4 font-semibold text-ink shadow-lg shadow-black/20 transition hover:bg-brand-deep md:bottom-6 md:right-6"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Ask about the menu</span>
        <span className="sm:hidden">Ask</span>
      </button>

      <div
        id="ask-panel"
        role="dialog"
        aria-label="Ask about the menu"
        inert={!open}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        className={clsx(
          "fixed bottom-40 right-4 z-40 flex max-h-[calc(100dvh-11.5rem)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl bg-white text-ink shadow-2xl ring-1 ring-black/10 transition md:bottom-24 md:right-6 md:max-h-[min(640px,calc(100dvh-7.5rem))]",
          open ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
          <span className="display text-2xl">Ask The Pit Stop</span>
          <button type="button" onClick={close} aria-label="Close" className="rounded-full p-1 hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        <div ref={listRef} role="log" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
          {messages.map((m, i) => (
            <div key={i} className={clsx("max-w-[85%] rounded-2xl px-3 py-2", m.role === "guest" ? "ml-auto bg-brand text-ink" : "bg-mist text-ink")}>
              {m.text}
            </div>
          ))}
          {busy && (
            <div aria-hidden="true" className="w-16 rounded-2xl bg-mist px-3 py-2 text-muted">
              …
            </div>
          )}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-mist">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {busy ? "Thinking…" : ""}
        </p>

        <form
          className="flex items-center gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a burger, allergens, hours…"
            maxLength={500}
            className="h-11 flex-1 rounded-full border border-line bg-mist px-4 text-sm outline-none focus:border-ink"
            aria-label="Your question"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="inline-flex size-11 items-center justify-center rounded-full bg-ink text-white disabled:opacity-40">
            <Send className="size-4" />
          </button>
        </form>
        <p className="px-4 pb-3 text-xs text-muted">Answers come from our menu data and may occasionally be off. Please confirm allergies with staff.</p>
      </div>
    </>
  );
}
