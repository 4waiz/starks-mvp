"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateMotionSpec } from "@/lib/gemini-client";
import type { DemoInput, MotionResponse } from "@/lib/motion-schema";
import { playBleep } from "@/lib/sound";

type HistoryItem = MotionResponse & {
  id: string;
  createdAt: string;
  styleText: string;
  actionText: string;
};

const phases = [
  "Fingerprinting performer style",
  "Synthesizing motion graph",
  "Compiling export manifest",
];

const actionPresets = [
  { label: "walk", value: "precision walk cycle with subtle arm sway" },
  { label: "run", value: "forward sprint burst into quick deceleration" },
  { label: "dance", value: "syncopated dance groove with full-body accents" },
  { label: "idle", value: "alert idle with breathing shifts and stance checks" },
];

const stylePresets = [
  { label: "tactical", value: "light-footed boxer with sharp stops" },
  { label: "heroic", value: "cinematic hero stride with grounded confidence" },
  { label: "stealth", value: "low-profile stealth mover with silent pivots" },
  { label: "comic", value: "elastic toon-inspired movement with punchy timing" },
];

function formatMotionJson(data: MotionResponse | null) {
  if (!data) return "{\n  // generate to see JSON\n}";
  return JSON.stringify(data.motionSpec, null, 2);
}

export function DemoPanel() {
  const reduceMotion = useReducedMotion();
  const [styleText, setStyleText] = useState("light-footed boxer with sharp stops");
  const [actionText, setActionText] = useState("sidestep + jab combo");
  const [engine, setEngine] = useState<DemoInput["engine"]>("unreal");
  const [rigType, setRigType] = useState<DemoInput["rigType"]>("humanoid");
  const [toggles, setToggles] = useState<DemoInput["toggles"]>({
    noFootSliding: true,
    contactConstraints: true,
    limpLeftLeg: false,
  });
  const [activeTab, setActiveTab] = useState("summary");
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MotionResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyView, setHistoryView] = useState<"cards" | "table">("cards");

  const payload: DemoInput = useMemo(
    () => ({ styleText, actionText, engine, rigType, toggles }),
    [actionText, engine, rigType, styleText, toggles],
  );

  async function onGenerate() {
    playBleep();
    setIsLoading(true);
    setProgress(6);
    setPhaseIndex(0);
    setActiveTab("summary");

    const interval = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(value + 7, 92);
        if (next >= 30) setPhaseIndex(1);
        if (next >= 65) setPhaseIndex(2);
        return next;
      });
    }, 300);

    try {
      const data = await generateMotionSpec(payload);
      window.clearInterval(interval);
      setProgress(100);
      setResult(data);
      setHistory((prev) =>
        [
          {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            styleText,
            actionText,
          },
          ...prev,
        ].slice(0, 5),
      );
      toast.success("Motion spec generated.");
    } catch (error) {
      window.clearInterval(interval);
      const message = error instanceof Error ? error.message : "Generation failed.";
      toast.error(message);
    } finally {
      window.setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setPhaseIndex(0);
      }, 400);
    }
  }

  async function onCopyJson() {
    if (!result) {
      toast.info("Generate a spec first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(result.motionSpec, null, 2));
      toast.success("JSON copied.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  }

  return (
    <section
      id="demo"
      className="section-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mb-8 sm:mb-10">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Interactive demo</p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
          generate a motion spec
        </h2>
      </div>

      <Card className="rounded-[2rem] p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 md:gap-8 xl:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">style</label>
              <Textarea
                value={styleText}
                onChange={(event) => setStyleText(event.target.value)}
                maxLength={220}
                placeholder="light-footed boxer with sharp stops"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">action</label>
              <Textarea
                value={actionText}
                onChange={(event) => setActionText(event.target.value)}
                maxLength={220}
                placeholder="sidestep + jab combo"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">
                  target engine
                </label>
                <Select value={engine} onValueChange={(value) => setEngine(value as DemoInput["engine"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unreal">unreal</SelectItem>
                    <SelectItem value="unity">unity</SelectItem>
                    <SelectItem value="blender">blender</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">rig type</label>
                <Select value={rigType} onValueChange={(value) => setRigType(value as DemoInput["rigType"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="humanoid">humanoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">no foot sliding</span>
                <Switch
                  checked={toggles.noFootSliding}
                  onCheckedChange={(checked) =>
                    setToggles((prev) => ({ ...prev, noFootSliding: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">contact constraints</span>
                <Switch
                  checked={toggles.contactConstraints}
                  onCheckedChange={(checked) =>
                    setToggles((prev) => ({ ...prev, contactConstraints: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">limp left leg</span>
                <Switch
                  checked={toggles.limpLeftLeg}
                  onCheckedChange={(checked) =>
                    setToggles((prev) => ({ ...prev, limpLeftLeg: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">preset chips</p>
              <div className="flex flex-wrap gap-2">
                {actionPresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="secondary"
                    size="sm"
                    onClick={() => setActionText(preset.value)}
                    className="text-[11px] uppercase tracking-[0.15em]"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {stylePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="secondary"
                    size="sm"
                    onClick={() => setStyleText(preset.value)}
                    className="text-[11px] uppercase tracking-[0.15em]"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={onGenerate}
              className="min-h-11 w-full sm:w-auto"
              disabled={isLoading || styleText.length < 3 || actionText.length < 3}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  generate
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Generation pipeline</p>
                <span className="text-xs text-white/55">{isLoading ? `${progress}%` : "idle"}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#22d3ee]"
                  animate={{ width: `${progress}%` }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
                />
              </div>
              <div className="mt-4 space-y-2 text-xs">
                {phases.map((phase, idx) => {
                  const active = idx <= phaseIndex && isLoading;
                  return (
                    <div key={phase} className="flex items-center gap-2 text-white/70">
                      <span
                        className={`pulse-dot ${active ? "bg-[#22d3ee]" : "bg-white/30"}`}
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      />
                      <span>{phase}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl py-1">
                <TabsTrigger value="summary">summary</TabsTrigger>
                <TabsTrigger value="json">motionSpec JSON</TabsTrigger>
                <TabsTrigger value="export">export</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="min-h-[220px]">
                <p className="text-sm leading-relaxed text-white/80">
                  {result?.summary || "Generate to preview a human-readable summary."}
                </p>
                {result ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.motionSpec.style_tags.slice(0, 6).map((tag) => (
                      <Badge key={tag} variant="neon">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="json" className="min-h-[220px]">
                <div className="mb-3 flex justify-end">
                  <Button variant="secondary" size="sm" onClick={onCopyJson}>
                    <Copy className="h-3.5 w-3.5" />
                    copy
                  </Button>
                </div>
                <pre className="max-h-[300px] overflow-auto rounded-2xl border border-white/10 bg-black/45 p-3 font-mono text-xs leading-relaxed text-[#cde8ff] sm:p-4 sm:text-sm">
                  {formatMotionJson(result)}
                </pre>
              </TabsContent>

              <TabsContent value="export" className="min-h-[220px]">
                <TooltipProvider>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["download fbx", "download bvh"].map((label) => (
                      <Tooltip key={label}>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="secondary"
                              disabled
                              className="w-full justify-between rounded-2xl px-4 py-6"
                            >
                              {label}
                              <Download className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>demo mode</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">last 5 generations</p>
            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant={historyView === "cards" ? "default" : "secondary"}
                size="sm"
                onClick={() => setHistoryView("cards")}
              >
                cards
              </Button>
              <Button
                variant={historyView === "table" ? "default" : "secondary"}
                size="sm"
                onClick={() => setHistoryView("table")}
              >
                table
              </Button>
            </div>
          </div>

          {history.length ? (
            <>
              <div className={historyView === "cards" ? "grid gap-3" : "hidden md:grid md:gap-3"}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate pr-2 font-medium text-white/90">
                        {item.actionText} in {item.styleText}
                      </p>
                      <span className="shrink-0 text-xs text-white/50">{item.createdAt}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/60">{item.summary}</p>
                  </div>
                ))}
              </div>

              <div className={historyView === "table" ? "hidden md:block" : "hidden"}>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                  <table className="min-w-[760px] w-full text-left text-sm text-white/80">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-white/55">
                      <tr>
                        <th className="sticky left-0 bg-[#070b1d] px-4 py-3">action</th>
                        <th className="px-4 py-3">style</th>
                        <th className="px-4 py-3">engine</th>
                        <th className="px-4 py-3">time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={`table-${item.id}`} className="border-b border-white/10 last:border-0">
                          <td className="sticky left-0 bg-[#070b1d] px-4 py-3 text-white/90">{item.actionText}</td>
                          <td className="px-4 py-3">{item.styleText}</td>
                          <td className="px-4 py-3 uppercase">{item.motionSpec.engine}</td>
                          <td className="px-4 py-3 text-xs text-white/55">{item.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-5 text-sm text-white/60">
              No generations yet.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
