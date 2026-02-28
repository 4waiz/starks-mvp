"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { playBleep } from "@/lib/sound";

type RunLine = {
  timestamp: string;
  text: string;
};

const LOG_LINES = [
  "ingest: video clip received (60s)",
  "decode: joint tracks normalized",
  "fingerprint: embedding extracted",
  "style: micro-timing features locked",
  "constraints: contact points=feet",
  "constraints: no_foot_sliding=true",
  "solver: motion graph synthesized",
  "cleanup: foot sliding correction applied",
  "quality: clean contacts verified",
  "retarget: humanoid profile mapped",
  "export: fbx ready",
  "export: bvh ready",
  "plugin: unity retarget ok",
  "session: pipeline complete",
];

function buildRunLines(seed: number): RunLine[] {
  const start = new Date(seed);
  return LOG_LINES.map((text, index) => {
    const date = new Date(start.getTime() + index * 1300);
    return {
      timestamp: `[${date.toTimeString().slice(0, 8)}]`,
      text,
    };
  });
}

type ProgressState = {
  line: number;
  char: number;
  done: boolean;
};

export function LiveTerminal() {
  const reduceMotion = useReducedMotion();
  const [cycleSeed, setCycleSeed] = useState(() => Date.now());
  const [progress, setProgress] = useState<ProgressState>({
    line: 0,
    char: 0,
    done: false,
  });

  const lines = useMemo(() => buildRunLines(cycleSeed), [cycleSeed]);

  useEffect(() => {
    let cycleTimer: ReturnType<typeof setTimeout> | null = null;
    let typeTimer: ReturnType<typeof setInterval> | null = null;

    if (reduceMotion) {
      setProgress({ line: lines.length, char: 0, done: true });
      cycleTimer = setTimeout(() => setCycleSeed(Date.now()), 20_000);

      return () => {
        if (cycleTimer) clearTimeout(cycleTimer);
      };
    }

    setProgress({ line: 0, char: 0, done: false });

    typeTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev.done) return prev;
        const currentLine = lines[prev.line]?.text ?? "";

        if (prev.char < currentLine.length) {
          return { ...prev, char: prev.char + 1 };
        }

        if (prev.line < lines.length - 1) {
          return { line: prev.line + 1, char: 0, done: false };
        }

        cycleTimer = setTimeout(
          () => setCycleSeed(Date.now()),
          6_000 + Math.floor(Math.random() * 4_000),
        );
        return { ...prev, done: true };
      });
    }, 24);

    return () => {
      if (typeTimer) clearInterval(typeTimer);
      if (cycleTimer) clearTimeout(cycleTimer);
    };
  }, [lines, reduceMotion]);

  const visibleLines = lines.filter((_, index) => (reduceMotion ? true : index <= progress.line));
  const lastRunText = lines.map((line) => `${line.timestamp} ${line.text}`).join("\n");

  const onCopyLastRun = async () => {
    try {
      await navigator.clipboard.writeText(lastRunText);
      playBleep();
      toast.success("Terminal log copied.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
      <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className="font-mono text-[10px] uppercase tracking-[0.16em]">starks kernel</Badge>
            <span className="pulse-dot bg-[#22d3ee]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
              {progress.done ? "idle" : "streaming"}
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={onCopyLastRun}>
            <Copy className="h-3.5 w-3.5" />
            copy last run
          </Button>
        </div>

        <div className="mt-4 max-h-[240px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 sm:p-4">
          <div className="space-y-1.5 font-mono text-xs leading-6 text-[#cde8ff]/90">
            {visibleLines.map((line, index) => {
              const isCurrentTyping = !reduceMotion && index === progress.line && !progress.done;
              const typedText = isCurrentTyping ? line.text.slice(0, progress.char) : line.text;

              return (
                <motion.p
                  key={`${cycleSeed}-${line.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="whitespace-nowrap"
                >
                  <span className="text-white/45">{line.timestamp}</span>{" "}
                  <span>{typedText}</span>
                  {isCurrentTyping ? <span className="ml-0.5 text-[#22d3ee]">▍</span> : null}
                </motion.p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
