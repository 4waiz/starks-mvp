"use client";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

const CHAT_HISTORY_KEY = "starks-chat-history-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeMessage(input: unknown): ChatMessage | null {
  if (!input || typeof input !== "object") return null;

  const candidate = input as Partial<ChatMessage>;
  if (candidate.role !== "user" && candidate.role !== "assistant") return null;
  if (typeof candidate.content !== "string") return null;
  if (typeof candidate.createdAt !== "string") return null;
  if (typeof candidate.id !== "string") return null;

  return {
    id: candidate.id,
    role: candidate.role,
    content: candidate.content.slice(0, 4000),
    createdAt: candidate.createdAt,
  };
}

export function loadChatHistory() {
  if (!isBrowser()) return [] as ChatMessage[];

  const raw = window.localStorage.getItem(CHAT_HISTORY_KEY);
  if (!raw) return [] as ChatMessage[];

  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [] as ChatMessage[];
    return parsed
      .map((item) => normalizeMessage(item))
      .filter(Boolean) as ChatMessage[];
  } catch {
    return [] as ChatMessage[];
  }
}

export function saveChatHistory(messages: ChatMessage[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-60)));
}

export function clearChatHistory() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CHAT_HISTORY_KEY);
}
