"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createSpeechController, type SpeechController } from "@/lib/speech";
import { playBleep } from "@/lib/sound";

type Props = {
  isLoading: boolean;
  onSendVoicePrompt: (text: string) => Promise<string | null>;
  onStateChange: (state: { listening: boolean; speaking: boolean }) => void;
};

function stripForSpeech(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function speakWithWebSpeech(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(stripForSpeech(text).slice(0, 800));
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

function playBase64Audio(audioBase64: string, mimeType: string) {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Failed to play audio."));
    void audio.play().catch(reject);
  });
}

export function VoiceChat({ isLoading, onSendVoicePrompt, onStateChange }: Props) {
  const reduceMotion = useReducedMotion();
  const controllerRef = useRef<SpeechController | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [manualVoicePrompt, setManualVoicePrompt] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [muted, setMuted] = useState(false);
  const [voice, setVoice] = useState("Puck");

  useEffect(() => {
    onStateChange({ listening, speaking });
  }, [listening, onStateChange, speaking]);

  const speakReply = useMemo(
    () => async (text: string) => {
      if (!text || muted) return;

      setSpeaking(true);
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice }),
        });

        if (!response.ok) {
          throw new Error("Server TTS unavailable.");
        }

        const data = (await response.json()) as { audioBase64?: string; mimeType?: string };
        if (!data.audioBase64 || !data.mimeType) {
          throw new Error("Invalid audio payload.");
        }

        await playBase64Audio(data.audioBase64, data.mimeType);
      } catch {
        await speakWithWebSpeech(text);
      } finally {
        setSpeaking(false);
      }
    },
    [muted, voice],
  );

  const submitTranscript = useMemo(
    () => async (text: string) => {
      const cleaned = text.trim();
      if (!cleaned || isLoading) return;

      setLastTranscript(cleaned);
      setInterimTranscript("");
      const reply = await onSendVoicePrompt(cleaned);
      if (reply && autoSpeak && !muted) {
        await speakReply(reply);
      }
    },
    [autoSpeak, isLoading, muted, onSendVoicePrompt, speakReply],
  );

  useEffect(() => {
    const controller = createSpeechController({
      onStart: () => setListening(true),
      onEnd: () => setListening(false),
      onInterim: (text) => setInterimTranscript(text),
      onFinal: (text) => {
        setInterimTranscript("");
        void submitTranscript(text);
      },
      onError: (message) => {
        setListening(false);
        toast.error(message);
      },
    });

    controllerRef.current = controller;
    setSupported(controller.supported);

    return () => {
      controller.destroy();
    };
  }, [submitTranscript]);

  const bars = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">Voice status</p>
            <p className="text-sm text-white">
              {listening ? "Listening..." : speaking ? "Speaking..." : "Idle"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                playBleep();
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] uppercase tracking-[0.12em] text-white/75"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {muted ? "muted" : "audio"}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">Push to talk</p>
            <span className="text-xs text-white/50">{supported ? "mic ready" : "fallback mode"}</span>
          </div>

          <Button
            type="button"
            className={`min-h-12 w-full ${listening ? "shadow-[0_0_28px_rgba(34,211,238,0.45)]" : ""}`}
            variant={listening ? "secondary" : "default"}
            onClick={() => {
              if (!supported) return;
              playBleep();
              if (listening) {
                controllerRef.current?.stop();
              } else {
                controllerRef.current?.start();
              }
            }}
            disabled={!supported || speaking || isLoading}
          >
            {supported ? (
              listening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  stop listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  start listening
                </>
              )
            ) : (
              <>
                <MicOff className="h-4 w-4" />
                speech recognition unavailable
              </>
            )}
          </Button>

          <div className="mt-4 flex h-10 items-end justify-center gap-1">
            {bars.map((bar) => (
              <motion.span
                key={bar}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#8b5cf6] via-[#d946ef] to-[#22d3ee]"
                initial={{ height: "20%" }}
                animate={
                  listening
                    ? { height: ["24%", "100%", "30%"] }
                    : speaking
                      ? { height: ["22%", "65%", "26%"] }
                      : { height: "24%" }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.9 + bar * 0.05, repeat: Number.POSITIVE_INFINITY }
                }
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/55">Transcript</p>
          <div className="min-h-[88px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/80">
            {interimTranscript ? (
              <span>{interimTranscript}</span>
            ) : lastTranscript ? (
              <span>{lastTranscript}</span>
            ) : (
              <span className="text-white/45">Start speaking to transcribe.</span>
            )}
          </div>
        </div>

        {!supported ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/55">Manual voice input</p>
            <Textarea
              value={manualVoicePrompt}
              onChange={(event) => setManualVoicePrompt(event.target.value)}
              placeholder="Type your voice prompt fallback..."
              maxLength={2000}
            />
            <Button
              className="mt-3 w-full"
              disabled={!manualVoicePrompt.trim() || isLoading}
              onClick={() => {
                void submitTranscript(manualVoicePrompt);
                setManualVoicePrompt("");
              }}
            >
              send prompt
            </Button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 px-3 py-3 sm:px-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-sm text-white/80">Auto-speak</span>
            <Switch
              checked={autoSpeak}
              onCheckedChange={(checked) => {
                playBleep();
                setAutoSpeak(checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-sm text-white/80">Mute output</span>
            <Switch
              checked={muted}
              onCheckedChange={(checked) => {
                playBleep();
                setMuted(checked);
              }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/55">Voice</p>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Puck">Puck</SelectItem>
                <SelectItem value="Kore">Kore</SelectItem>
                <SelectItem value="Aoede">Aoede</SelectItem>
                <SelectItem value="Charon">Charon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
