
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Command,
  Copy,
  Download,
  FileJson,
  Loader2,
  Save,
  Share2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { StylesLibraryModal } from "@/components/StylesLibraryModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { generateMotionSpec } from "@/lib/gemini-client";
import { APPLY_PRESET_EVENT, emitOpenCommandPalette } from "@/lib/hotkeys";
import type { DemoInput, MotionResponse, MotionSpec } from "@/lib/motion-schema";
import { playBleep } from "@/lib/sound";
import {
  createProject,
  createShareRecord,
  getActiveProjectId,
  getAnalyticsSummary,
  getRecentGenerations,
  getTourCompleted,
  pushRecentGeneration,
  recordGenerationAnalytics,
  saveOutputToProject,
  setTourCompleted,
  subscribeStorageUpdates,
} from "@/lib/storage";

type HistoryItem = MotionResponse & {
  id: string;
  createdAt: string;
  styleText: string;
  actionText: string;
};

type ExportFile = {
  filename: string;
  size: string;
  format: "FBX" | "BVH";
};

const phases = [
  "Ingesting source intent",
  "Extracting motion fingerprint",
  "Synthesizing generation graph",
  "Compiling export manifest",
];

const presetLibrary = [
  {
    id: "boxer",
    title: "Boxer Combo",
    styleText: "light-footed boxer with sharp stops",
    actionText: "sidestep + jab combo",
    tags: ["combat", "fast"],
  },
  {
    id: "hero",
    title: "Hero Burst",
    styleText: "cinematic hero stride with grounded confidence",
    actionText: "run-up, pivot, and strong pose hold",
    tags: ["cinematic", "mid"],
  },
  {
    id: "stealth",
    title: "Stealth Sweep",
    styleText: "silent stealth mover with low posture and soft landings",
    actionText: "low-profile patrol with two direction checks",
    tags: ["stealth", "mid"],
  },
  {
    id: "groove",
    title: "Groove Loop",
    styleText: "street dance groove with syncopated footwork and torso bounce",
    actionText: "8-count groove, spin entry, and reset",
    tags: ["dance", "playful"],
  },
];

const tourSteps = [
  {
    title: "choose style",
    body: "Pick a preset or open the style library to seed your kinetic identity.",
  },
  {
    title: "type action",
    body: "Describe the exact motion behavior you want to generate next.",
  },
  {
    title: "generate + export",
    body: "Run generation, inspect quality/confidence, then prepare a demo export.",
  },
];

function formatMotionJson(data: MotionResponse | null) {
  if (!data) return "{\n  // generate to see JSON\n}";
  return JSON.stringify(data.motionSpec, null, 2);
}

function qualityLabel(value: string) {
  return value.replaceAll("_", " ");
}

function sanitizeFileSegment(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "")
    .slice(0, 32);
}

function historyFromRecents() {
  return getRecentGenerations(5).map<HistoryItem>((item) => ({
    id: item.id,
    createdAt: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    styleText: item.styleText,
    actionText: item.actionText,
    summary: item.summary,
    motionSpec: item.motionSpec,
  }));
}

function buildSavedPayload(item: {
  summary: string;
  styleText: string;
  actionText: string;
  motionSpec: MotionSpec;
}) {
  return {
    summary: item.summary,
    styleText: item.styleText,
    actionText: item.actionText,
    motionSpec: item.motionSpec,
  };
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
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MotionResponse | null>(null);
  const [optimisticSummary, setOptimisticSummary] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [exportFormat, setExportFormat] = useState<"FBX" | "BVH">("FBX");
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<"idle" | "preparing" | "ready">("idle");
  const [preparedFile, setPreparedFile] = useState<ExportFile | null>(null);
  const [analytics, setAnalytics] = useState({
    generationsToday: 0,
    avgExportSeconds: 0,
    activeProjects: 0,
  });
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const payload: DemoInput = useMemo(
    () => ({ styleText, actionText, engine, rigType, toggles }),
    [actionText, engine, rigType, styleText, toggles],
  );

  const styleError = submitted && styleText.trim().length < 3;
  const actionError = submitted && actionText.trim().length < 3;

  useEffect(() => {
    setHistory(historyFromRecents());
    setAnalytics(getAnalyticsSummary());
    if (!getTourCompleted()) {
      setTourOpen(true);
    }

    const unsubscribe = subscribeStorageUpdates(() => {
      setAnalytics(getAnalyticsSummary());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const onApplyPreset = (event: Event) => {
      const customEvent = event as CustomEvent<{ styleText?: string; actionText?: string }>;
      if (customEvent.detail?.styleText) {
        setStyleText(customEvent.detail.styleText);
      }
      if (customEvent.detail?.actionText) {
        setActionText(customEvent.detail.actionText);
      }
      toast.success("Preset loaded.");
    };

    window.addEventListener(APPLY_PRESET_EVENT, onApplyPreset as EventListener);
    return () => window.removeEventListener(APPLY_PRESET_EVENT, onApplyPreset as EventListener);
  }, []);

  async function onGenerate() {
    setSubmitted(true);
    const cleanStyle = styleText.trim();
    const cleanAction = actionText.trim();
    if (cleanStyle.length < 3 || cleanAction.length < 3) {
      toast.error("Style and action must be at least 3 characters.");
      return;
    }

    playBleep();
    const startedAt = performance.now();
    setIsLoading(true);
    setProgress(8);
    setPhaseIndex(0);
    setActiveTab("summary");
    setResult(null);
    setOptimisticSummary(`Generating "${cleanAction}" in the "${cleanStyle}" identity...`);
    setExportStatus("idle");
    setPreparedFile(null);
    setExportProgress(0);

    const interval = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(value + 5, 92);
        if (next >= 24) setPhaseIndex(1);
        if (next >= 50) setPhaseIndex(2);
        if (next >= 78) setPhaseIndex(3);
        return next;
      });
    }, 240);

    try {
      const data = await generateMotionSpec(payload);
      const elapsed = Math.max(300, Math.round(performance.now() - startedAt));

      window.clearInterval(interval);
      setProgress(100);
      setResult(data);
      setOptimisticSummary(null);

      const historyItem: HistoryItem = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        styleText: cleanStyle,
        actionText: cleanAction,
      };

      setHistory((prev) => [historyItem, ...prev].slice(0, 5));
      pushRecentGeneration({
        summary: data.summary,
        styleText: cleanStyle,
        actionText: cleanAction,
        motionSpec: data.motionSpec,
      });
      recordGenerationAnalytics(elapsed);
      toast.success("Motion spec generated.");
    } catch (error) {
      window.clearInterval(interval);
      setOptimisticSummary(null);
      const message = error instanceof Error ? error.message : "Generation failed.";
      toast.error(message);
    } finally {
      window.setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setPhaseIndex(0);
      }, 350);
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

  function saveGeneration(item: {
    summary: string;
    styleText: string;
    actionText: string;
    motionSpec: MotionSpec;
  }) {
    const activeProjectId = getActiveProjectId() ?? createProject("Primary project")?.id ?? null;
    const saved = saveOutputToProject(buildSavedPayload(item), activeProjectId);
    if (!saved) {
      toast.error("Unable to save generation.");
      return;
    }
    playBleep();
    toast.success("Saved to projects.");
  }

  function shareGeneration(item: {
    summary: string;
    styleText: string;
    actionText: string;
    motionSpec: MotionSpec;
  }) {
    const now = new Date().toISOString();
    const shareRecord = createShareRecord({
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...buildSavedPayload(item),
    });

    setShareLink(`${window.location.origin}/share/${shareRecord.id}`);
    setShareOpen(true);
    playBleep();
    toast.success("Share link created.");
  }

  async function copyShareLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  }

  async function onPrepareExport() {
    if (!result) {
      toast.info("Generate a spec first.");
      return;
    }

    playBleep();
    setExportStatus("preparing");
    setExportProgress(8);
    setPreparedFile(null);

    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      setExportProgress((value) => Math.min(value + 9, 94));
    }, 180);

    const delay = 1300 + Math.floor(Math.random() * 900);
    window.setTimeout(() => {
      window.clearInterval(interval);
      const actionSeed = sanitizeFileSegment(result.motionSpec.action_tags[0] ?? "motion_spec");
      const ext = exportFormat.toLowerCase();
      const sizeMb = (1.1 + result.motionSpec.tempo_bpm / 190 + Math.random() * 0.65).toFixed(2);

      setPreparedFile({
        filename: `starks_${actionSeed}_${Date.now()}.${ext}`,
        size: `${sizeMb} MB`,
        format: exportFormat,
      });
      setExportStatus("ready");
      setExportProgress(100);

      recordGenerationAnalytics(Math.max(300, Math.round(performance.now() - startedAt)));
      toast.success(`${exportFormat} export prepared (demo mode).`);
    }, delay);
  }

  async function onCopyManifest() {
    if (!result) {
      toast.info("Generate first to build manifest.");
      return;
    }

    const manifest = {
      created_at: new Date().toISOString(),
      engine: result.motionSpec.engine,
      retargeting: result.motionSpec.export.retargeting,
      format_requested: exportFormat,
      style_tags: result.motionSpec.style_tags,
      action_tags: result.motionSpec.action_tags,
      quality_checks: result.motionSpec.quality_checks,
      confidence_score: result.motionSpec.confidence_score,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
      toast.success("Export manifest copied.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  }

  function onTourNext() {
    if (tourStep >= tourSteps.length - 1) {
      setTourOpen(false);
      setTourCompleted();
      return;
    }
    setTourStep((value) => value + 1);
  }

  const currentSummary = result?.summary ?? optimisticSummary ?? "Generate to preview a human-readable summary.";
  const confidenceScore = result?.motionSpec.confidence_score ?? 0;
  const qualityChecks = result?.motionSpec.quality_checks ?? [];

  return (
    <section
      id="demo"
      className="section-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Interactive demo</p>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
            generate a motion spec
          </h2>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">generations today</p>
            <p className="text-lg font-semibold text-white">{analytics.generationsToday}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">avg export time</p>
            <p className="text-lg font-semibold text-white">{analytics.avgExportSeconds || 0}s</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">active projects</p>
            <p className="text-lg font-semibold text-white">{analytics.activeProjects}</p>
          </div>
        </div>
      </div>

      <Card className="relative overflow-hidden rounded-[2rem] p-4 sm:p-6 md:p-8">
        <AnimatePresence>
          {tourOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-4 top-4 z-20 max-w-sm rounded-2xl border border-[#8b5cf6]/40 bg-[#0a1024]/95 p-3 shadow-[0_0_28px_rgba(139,92,246,0.35)] backdrop-blur-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d6c2ff]/80">
                quick tour {tourStep + 1}/3
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{tourSteps[tourStep].title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{tourSteps[tourStep].body}</p>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={onTourNext}>
                  {tourStep === tourSteps.length - 1 ? "finish" : "next"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTourOpen(false);
                    setTourCompleted();
                  }}
                >
                  skip
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid gap-6 md:gap-8 xl:grid-cols-2">
          <div className="space-y-5">
            <div className={tourOpen && tourStep === 0 ? "rounded-2xl ring-1 ring-[#8b5cf6]/60 ring-offset-2 ring-offset-[#060a1a]" : ""}>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs uppercase tracking-[0.18em] text-white/60">style</label>
                <Button size="sm" variant="secondary" onClick={() => setStylesOpen(true)}>
                  <WandSparkles className="h-3.5 w-3.5" />
                  explore styles
                </Button>
              </div>
              <Textarea
                value={styleText}
                onChange={(event) => setStyleText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void onGenerate();
                  }
                }}
                maxLength={220}
                placeholder="light-footed boxer with sharp stops"
              />
              {styleError ? <p className="mt-2 text-xs text-[#f6b4ff]">Style must be at least 3 characters.</p> : null}
            </div>

            <div className={tourOpen && tourStep === 1 ? "rounded-2xl ring-1 ring-[#8b5cf6]/60 ring-offset-2 ring-offset-[#060a1a]" : ""}>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">action</label>
              <Textarea
                value={actionText}
                onChange={(event) => setActionText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void onGenerate();
                  }
                }}
                maxLength={220}
                placeholder="sidestep + jab combo"
              />
              {actionError ? <p className="mt-2 text-xs text-[#f6b4ff]">Action must be at least 3 characters.</p> : null}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">presets library</p>
                <button
                  type="button"
                  onClick={() => {
                    playBleep();
                    emitOpenCommandPalette();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white/80"
                >
                  <Command className="h-3.5 w-3.5" />
                  cmd+k
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {presetLibrary.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      playBleep();
                      setStyleText(preset.styleText);
                      setActionText(preset.actionText);
                    }}
                    className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-left transition-colors hover:border-[#8b5cf6]/45 hover:bg-[#8b5cf6]/10"
                  >
                    <p className="text-sm font-semibold text-white">{preset.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {preset.tags.map((tag) => (
                        <Badge key={tag} className="text-[10px] uppercase">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">target engine</label>
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
                  onCheckedChange={(checked) => setToggles((prev) => ({ ...prev, noFootSliding: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">contact constraints</span>
                <Switch
                  checked={toggles.contactConstraints}
                  onCheckedChange={(checked) => setToggles((prev) => ({ ...prev, contactConstraints: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">limp left leg</span>
                <Switch
                  checked={toggles.limpLeftLeg}
                  onCheckedChange={(checked) => setToggles((prev) => ({ ...prev, limpLeftLeg: checked }))}
                />
              </div>
            </div>

            <div className={tourOpen && tourStep === 2 ? "rounded-2xl ring-1 ring-[#8b5cf6]/60 ring-offset-2 ring-offset-[#060a1a]" : ""}>
              <div className="flex flex-wrap gap-3">
                <Button onClick={onGenerate} className="min-h-11 flex-1 sm:flex-none" disabled={isLoading}>
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
                <Button
                  variant="secondary"
                  className="min-h-11"
                  onClick={() => {
                    if (!result) {
                      toast.info("Generate first to save.");
                      return;
                    }
                    saveGeneration({
                      summary: result.summary,
                      styleText,
                      actionText,
                      motionSpec: result.motionSpec,
                    });
                  }}
                >
                  <Save className="h-4 w-4" />
                  save
                </Button>
                <Button
                  variant="secondary"
                  className="min-h-11"
                  onClick={() => {
                    if (!result) {
                      toast.info("Generate first to share.");
                      return;
                    }
                    shareGeneration({
                      summary: result.summary,
                      styleText,
                      actionText,
                      motionSpec: result.motionSpec,
                    });
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  share
                </Button>
              </div>
              <p className="mt-2 text-xs text-white/55">Enter to generate. Cmd/Ctrl + K for command palette.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Processing pipeline</p>
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
                  const isActive = isLoading && idx === phaseIndex;
                  const isComplete = isLoading ? idx < phaseIndex : false;
                  return (
                    <div key={phase} className="flex items-center gap-2 text-white/70">
                      <span className={`pulse-dot ${isActive || isComplete ? "bg-[#22d3ee]" : "bg-white/30"}`} />
                      <span>{phase}</span>
                      {isComplete ? <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-[#22d3ee]" /> : null}
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

              <TabsContent value="summary" className="min-h-[250px]">
                {isLoading ? (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-white/75">{currentSummary}</p>
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-10/12 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-7/12 animate-pulse rounded bg-white/10" />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-relaxed text-white/80">{currentSummary}</p>
                    {result ? (
                      <>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/55">
                            <span>confidence</span>
                            <span>{confidenceScore}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] via-[#8b5cf6] to-[#d946ef]"
                              initial={{ width: 0 }}
                              animate={{ width: `${confidenceScore}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {qualityChecks.map((check) => (
                            <Badge key={check} variant="neon">
                              {qualityLabel(check)}
                            </Badge>
                          ))}
                          <Badge variant="cyan">retarget-ready</Badge>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="json" className="min-h-[250px]">
                <div className="mb-3 flex justify-end">
                  <Button variant="secondary" size="sm" onClick={onCopyJson}>
                    <Copy className="h-3.5 w-3.5" />
                    copy
                  </Button>
                </div>
                {isLoading ? (
                  <div className="space-y-2 rounded-2xl border border-white/10 bg-black/45 p-4">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-3 animate-pulse rounded bg-white/10"
                        style={{ width: `${100 - index * 6}%` }}
                      />
                    ))}
                  </div>
                ) : (
                  <pre className="max-h-[320px] overflow-auto rounded-2xl border border-white/10 bg-black/45 p-3 font-mono text-xs leading-relaxed text-[#cde8ff] sm:p-4 sm:text-sm">
                    {formatMotionJson(result)}
                  </pre>
                )}
              </TabsContent>

              <TabsContent value="export" className="min-h-[250px]">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "FBX" | "BVH")}>
                    <SelectTrigger>
                      <SelectValue placeholder="format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FBX">FBX</SelectItem>
                      <SelectItem value="BVH">BVH</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="secondary" onClick={onPrepareExport}>
                    <Download className="h-4 w-4" />
                    prepare export
                  </Button>
                  <Button variant="secondary" onClick={onCopyManifest}>
                    <FileJson className="h-4 w-4" />
                    copy manifest
                  </Button>
                </div>

                {exportStatus === "preparing" ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/55">preparing export...</p>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#22d3ee]"
                        animate={{ width: `${exportProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                ) : null}

                {preparedFile ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="truncate text-sm font-semibold text-white">{preparedFile.filename}</p>
                        <p className="text-xs text-white/60">
                          {preparedFile.size} • {preparedFile.format} • demo mode
                        </p>
                      </div>
                      <Button variant="secondary" disabled>
                        download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-4 text-sm text-white/60">
                    No prepared files yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/60">generation history</p>
          {history.length ? (
            <div className="grid gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="min-w-0 flex-1 truncate pr-2 font-medium text-white/90">
                      {item.actionText} in {item.styleText}
                    </p>
                    <span className="text-xs text-white/50">{item.createdAt}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setStyleText(item.styleText);
                        setActionText(item.actionText);
                        setResult({ summary: item.summary, motionSpec: item.motionSpec });
                        setActiveTab("summary");
                        playBleep();
                      }}
                    >
                      load
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        saveGeneration({
                          summary: item.summary,
                          styleText: item.styleText,
                          actionText: item.actionText,
                          motionSpec: item.motionSpec,
                        })
                      }
                    >
                      <Save className="h-3.5 w-3.5" />
                      save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        shareGeneration({
                          summary: item.summary,
                          styleText: item.styleText,
                          actionText: item.actionText,
                          motionSpec: item.motionSpec,
                        })
                      }
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-5 text-sm text-white/60">
              No generations yet. Try a preset and hit generate.
            </p>
          )}
        </div>
      </Card>

      <StylesLibraryModal
        open={stylesOpen}
        onOpenChange={setStylesOpen}
        onApplyStyle={(nextStyle) => {
          setStyleText(nextStyle);
          toast.success("Style applied.");
        }}
      />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share generation</DialogTitle>
            <DialogDescription>
              Local demo link. It opens on this browser profile and device.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="break-all font-mono text-xs text-[#cde8ff]">{shareLink || "No link available."}</p>
          </div>
          <Button onClick={copyShareLink}>
            <Copy className="h-4 w-4" />
            copy link
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
