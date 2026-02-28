"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, MessageSquare, Mic, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { TextChat } from "@/components/TextChat";
import { VoiceChat } from "@/components/VoiceChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
  type ChatMessage,
} from "@/lib/chat-storage";
import { playBleep } from "@/lib/sound";

type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialAssistantMessage: ChatMessage = {
  id: "starks-welcome",
  role: "assistant",
  content:
    "Starks AI Assistant online. Ask about identity cloning, motion generation, export, or licensing vault.",
  createdAt: new Date(0).toISOString(),
};

function createMessage(role: "user" | "assistant", content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("voice");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const stored = loadChatHistory();
    setMessages(stored.length ? stored : [initialAssistantMessage]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveChatHistory(messages);
  }, [hydrated, messages]);

  const buttonLabel = useMemo(() => {
    if (speaking) return "Speaking...";
    if (listening) return "Listening...";
    return "Voice chat";
  }, [listening, speaking]);

  async function sendMessage(text: string): Promise<string | null> {
    const trimmed = text.trim().slice(0, 2000);
    if (!trimmed) return null;
    if (isLoading) return null;

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    const page = window.location.hash.includes("demo") ? "demo" : "landing";
    const requestMessages: ChatApiMessage[] = nextMessages
      .slice(-20)
      .map((item) => ({ role: item.role, content: item.content.slice(0, 2000) }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: requestMessages,
          context: { page },
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        const rawError = errorData?.error || "Chat request failed.";
        const cleanError = rawError.replace(/\s+/g, " ").slice(0, 180);
        throw new Error(cleanError);
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();
      if (!reply) {
        throw new Error("Assistant returned an empty response.");
      }

      setMessages((prev) => [...prev, createMessage("assistant", reply)]);
      return reply;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get chat response.";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewChat() {
    playBleep();
    clearChatHistory();
    setMessages([initialAssistantMessage]);
    toast.success("Started a new chat.");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playBleep();
          setOpen(true);
          setActiveTab("voice");
        }}
        className="fixed bottom-5 right-4 z-[70] inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-[linear-gradient(120deg,rgba(139,92,246,0.88),rgba(217,70,239,0.86))] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98] sm:right-6"
      >
        <MessageCircle className="h-4 w-4" />
        <Mic className="h-3.5 w-3.5 opacity-80" />
        {buttonLabel}
      </button>

      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setListening(false);
            setSpeaking(false);
          }
        }}
      >
        <SheetContent
          side="right"
          className="z-[80] w-screen max-w-none border-l border-white/15 bg-[#040918]/95 p-0 backdrop-blur-xl [&>button]:hidden sm:w-[420px] sm:max-w-[420px]"
        >
          <div className="flex h-[100dvh] flex-col">
            <div className="border-b border-white/10 px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Starks AI Assistant</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="pulse-dot bg-[#22d3ee]" />
                    <span className="text-xs uppercase tracking-[0.12em] text-white/60">online</span>
                    <Badge variant="neon" className="text-[10px]">
                      {buttonLabel.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleNewChat}>
                    <Plus className="h-3.5 w-3.5" />
                    new chat
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      playBleep();
                      setOpen(false);
                      setListening(false);
                      setSpeaking(false);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                    close
                  </Button>
                </div>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                const next = value as "chat" | "voice";
                setActiveTab(next);
                if (next === "chat") {
                  setListening(false);
                  setSpeaking(false);
                }
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="px-3 py-3 sm:px-4">
                <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl py-1">
                  <TabsTrigger value="chat">
                    <MessageSquare className="h-3.5 w-3.5" />
                    chat
                  </TabsTrigger>
                  <TabsTrigger value="voice">
                    <Mic className="h-3.5 w-3.5" />
                    voice
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
                <TextChat
                  messages={messages}
                  isLoading={isLoading}
                  onSend={async (text) => {
                    await sendMessage(text);
                  }}
                />
              </TabsContent>

              <TabsContent value="voice" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
                <VoiceChat
                  isLoading={isLoading}
                  onSendVoicePrompt={async (text) => sendMessage(text)}
                  onStateChange={(state) => {
                    setListening(state.listening);
                    setSpeaking(state.speaking);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
