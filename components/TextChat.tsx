"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/lib/chat-storage";
import { playBleep } from "@/lib/sound";

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => Promise<void>;
};

const QUICK_PROMPTS = [
  "what is starks ai?",
  "generate motion spec",
  "pricing",
  "how it works",
];

export function TextChat({ messages, isLoading, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function handleSend(text: string) {
    const next = text.trim();
    if (!next || isLoading) return;
    setDraft("");
    playBleep();
    await onSend(next);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 px-3 py-3 sm:px-4">
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/50">Quick prompts</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                void handleSend(prompt);
              }}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        {hasMessages ? (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto border border-[#8b5cf6]/40 bg-[#8b5cf6]/18 text-white"
                      : "border border-white/10 bg-black/35 text-white/85"
                  }`}
                >
                  {message.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-white/75">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22d3ee]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8b5cf6]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d946ef]" />
                <span className="text-xs uppercase tracking-[0.12em]">typing...</span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/25 px-4 py-4 text-sm text-white/60">
            Start a chat to ask about the product, demo workflow, or pricing.
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-3 py-3 sm:px-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend(draft);
          }}
          className="flex min-w-0 items-center gap-2"
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask Starks AI assistant..."
            maxLength={2000}
            disabled={isLoading}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !draft.trim()}
            className="shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 text-white" strokeWidth={2.4} />
          </Button>
        </form>
      </div>
    </div>
  );
}
