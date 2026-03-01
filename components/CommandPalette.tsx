"use client";

import { useEffect, useMemo, useState } from "react";
import { CornerDownLeft } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  OPEN_COMMAND_PALETTE_EVENT,
  emitApplyPreset,
  useHotkeys,
} from "@/lib/hotkeys";
import { playBleep } from "@/lib/sound";
import {
  getRecentGenerations,
  subscribeStorageUpdates,
  type RecentGeneration,
} from "@/lib/storage";

type PaletteItem = {
  id: string;
  label: string;
  subtitle?: string;
  group: "Sections" | "Demo Presets" | "Recent Generations";
  keywords: string;
  shortcut?: string;
  onSelect: () => void;
};

const sectionItems: Array<{
  id: string;
  label: string;
  subtitle: string;
  sectionId: string;
}> = [
  { id: "home", label: "Go to Home", subtitle: "Hero command center", sectionId: "home" },
  { id: "how", label: "Go to How it works", subtitle: "3-step pipeline", sectionId: "how-it-works" },
  { id: "demo", label: "Go to Demo", subtitle: "Generate a motion spec", sectionId: "demo" },
  { id: "pricing", label: "Go to Pricing", subtitle: "Plans and access", sectionId: "pricing" },
  { id: "faq", label: "Go to FAQ", subtitle: "Production answers", sectionId: "faq" },
  { id: "contact", label: "Go to Contact", subtitle: "Request access", sectionId: "contact" },
];

const presetItems = [
  {
    id: "preset-boxer",
    label: "Preset: boxer sidestep jab",
    subtitle: "tactical style + jab combo",
    styleText: "light-footed boxer with sharp stops",
    actionText: "sidestep + jab combo",
  },
  {
    id: "preset-hero",
    label: "Preset: cinematic hero sprint",
    subtitle: "heroic style + sprint into stop",
    styleText: "cinematic hero stride with grounded confidence",
    actionText: "forward sprint burst into hard deceleration",
  },
  {
    id: "preset-stealth",
    label: "Preset: stealth silent patrol",
    subtitle: "low profile + directional checks",
    styleText: "silent stealth mover with low posture and soft landings",
    actionText: "silent patrol with quick corner checks",
  },
  {
    id: "preset-dance",
    label: "Preset: groove sequence",
    subtitle: "playful dance timing",
    styleText: "street dance groove with syncopated footwork and torso bounce",
    actionText: "8-count groove with turn and reset",
  },
];

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function fuzzyScore(source: string, query: string) {
  if (!query) return 1_000;
  const text = source.toLowerCase();
  const q = query.toLowerCase();

  const exactIndex = text.indexOf(q);
  if (exactIndex >= 0) {
    return 850 - exactIndex * 2;
  }

  let score = 0;
  let qIdx = 0;
  for (let i = 0; i < text.length && qIdx < q.length; i += 1) {
    if (text[i] === q[qIdx]) {
      score += 12;
      qIdx += 1;
    }
  }

  if (qIdx !== q.length) return -1;
  return score - Math.max(0, text.length - q.length) * 0.15;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentGeneration[]>([]);

  useEffect(() => {
    const refresh = () => setRecent(getRecentGenerations(6));
    refresh();
    const unsubscribe = subscribeStorageUpdates(refresh);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpen);
  }, []);

  useHotkeys([
    {
      key: "k",
      metaOrCtrl: true,
      handler: (event) => {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        setOpen((value) => !value);
      },
    },
  ]);

  const items = useMemo<PaletteItem[]>(() => {
    const sections: PaletteItem[] = sectionItems.map((item) => ({
      id: item.id,
      label: item.label,
      subtitle: item.subtitle,
      group: "Sections",
      keywords: `section ${item.sectionId} ${item.label} ${item.subtitle}`,
      shortcut: item.id === "home" ? "H" : undefined,
      onSelect: () => {
        const element = document.getElementById(item.sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    }));

    const presets: PaletteItem[] = presetItems.map((item) => ({
      id: item.id,
      label: item.label,
      subtitle: item.subtitle,
      group: "Demo Presets",
      keywords: `${item.styleText} ${item.actionText} preset demo`,
      onSelect: () => {
        emitApplyPreset({
          styleText: item.styleText,
          actionText: item.actionText,
        });
        const element = document.getElementById("demo");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    }));

    const recentItems: PaletteItem[] = recent.map((item) => ({
      id: item.id,
      label: `${item.actionText} -> ${item.motionSpec.engine}`,
      subtitle: item.styleText,
      group: "Recent Generations",
      keywords: `${item.summary} ${item.styleText} ${item.actionText} ${item.motionSpec.engine}`,
      onSelect: () => {
        emitApplyPreset({
          styleText: item.styleText,
          actionText: item.actionText,
        });
        const element = document.getElementById("demo");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    }));

    return [...sections, ...presets, ...recentItems];
  }, [recent]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items
      .map((item) => ({
        item,
        score: fuzzyScore(
          `${item.label} ${item.subtitle ?? ""} ${item.keywords}`,
          normalizedQuery,
        ),
      }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [items, query]);

  const grouped = useMemo(
    () => [
      {
        name: "Sections" as const,
        items: filteredItems.filter((item) => item.group === "Sections"),
      },
      {
        name: "Demo Presets" as const,
        items: filteredItems.filter((item) => item.group === "Demo Presets"),
      },
      {
        name: "Recent Generations" as const,
        items: filteredItems.filter((item) => item.group === "Recent Generations"),
      },
    ],
    [filteredItems],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 bg-[#030712] p-0 sm:h-auto sm:max-h-[80vh] sm:w-[95vw] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-white/15">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search sections, presets, and recent generations.
        </DialogDescription>
        <Command shouldFilter={false} className="h-full bg-transparent">
          <div className="relative">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Jump to section, preset, or recent generation..."
              className="pr-4"
            />
          </div>

          <CommandList className="max-h-none overflow-y-auto">
            <CommandEmpty className="px-4 py-8 text-center text-sm text-white/60">
              No results. Try a different keyword.
            </CommandEmpty>

            {grouped.map((group) =>
              group.items.length ? (
                <CommandGroup key={group.name} heading={group.name}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.subtitle ?? ""} ${item.keywords}`}
                      onSelect={() => {
                        playBleep();
                        setOpen(false);
                        setQuery("");
                        item.onSelect();
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{item.label}</p>
                        {item.subtitle ? (
                          <p className="truncate text-xs text-white/55">{item.subtitle}</p>
                        ) : null}
                      </div>
                      {item.shortcut ? (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null,
            )}
          </CommandList>

          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/50 sm:px-4">
            <span>Fast nav</span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="h-3.5 w-3.5" />
              select
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
