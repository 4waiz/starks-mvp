"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { playBleep } from "@/lib/sound";

type Tempo = "slow" | "mid" | "fast";
type Genre = "combat" | "cinematic" | "dance" | "sports" | "stealth";
type Mood = "aggressive" | "calm" | "playful" | "tense" | "focused";

type StyleSeed = {
  id: string;
  name: string;
  description: string;
  styleText: string;
  tempo: Tempo;
  genre: Genre;
  mood: Mood;
};

const STYLE_SEEDS: StyleSeed[] = [
  {
    id: "s1",
    name: "Shadow Boxer",
    description: "Sharp upper body snaps with elastic foot pivots.",
    styleText: "light-footed boxer with sharp stops and reactive pivots",
    tempo: "fast",
    genre: "combat",
    mood: "focused",
  },
  {
    id: "s2",
    name: "Arena Striker",
    description: "Forward pressure, hard plant steps, heavy shoulder drive.",
    styleText: "aggressive striker with grounded weight and explosive entries",
    tempo: "fast",
    genre: "combat",
    mood: "aggressive",
  },
  {
    id: "s3",
    name: "Guarded Duelist",
    description: "Measured stance shifts and disciplined spacing.",
    styleText: "defensive duelist with measured footwork and compact guard",
    tempo: "mid",
    genre: "combat",
    mood: "tense",
  },
  {
    id: "s4",
    name: "Stealth Runner",
    description: "Low center of mass and quiet directional changes.",
    styleText: "silent stealth mover with low posture and soft landings",
    tempo: "mid",
    genre: "stealth",
    mood: "focused",
  },
  {
    id: "s5",
    name: "Ghost Walk",
    description: "Minimal bounce, gliding transitions, low visibility profile.",
    styleText: "gliding infiltrator with smooth cadence and low-impact steps",
    tempo: "slow",
    genre: "stealth",
    mood: "calm",
  },
  {
    id: "s6",
    name: "Silent Intercept",
    description: "Short stealth bursts with controlled decel.",
    styleText: "stealth interceptor with quick bursts and controlled stops",
    tempo: "fast",
    genre: "stealth",
    mood: "tense",
  },
  {
    id: "s7",
    name: "Cinematic Hero",
    description: "Broad silhouette and confident stride rhythm.",
    styleText: "cinematic hero stride with broad posture and assertive timing",
    tempo: "mid",
    genre: "cinematic",
    mood: "focused",
  },
  {
    id: "s8",
    name: "Epic Commander",
    description: "Weighty pauses and deliberate directional turns.",
    styleText: "commanding cinematic movement with deliberate pivots and pauses",
    tempo: "slow",
    genre: "cinematic",
    mood: "calm",
  },
  {
    id: "s9",
    name: "Action Trailer",
    description: "Fast-pace impact accents and dramatic recoveries.",
    styleText: "high-intensity trailer action with dramatic impacts and recoveries",
    tempo: "fast",
    genre: "cinematic",
    mood: "aggressive",
  },
  {
    id: "s10",
    name: "Street Groove",
    description: "Syncopated steps with torso bounce accents.",
    styleText: "street dance groove with syncopated footwork and torso bounce",
    tempo: "mid",
    genre: "dance",
    mood: "playful",
  },
  {
    id: "s11",
    name: "Club Pulse",
    description: "Continuous rhythm, loop-friendly timing.",
    styleText: "club dancer with continuous pulse and loopable transitions",
    tempo: "fast",
    genre: "dance",
    mood: "playful",
  },
  {
    id: "s12",
    name: "Contemporary Flow",
    description: "Long lines and fluid weight transfer.",
    styleText: "contemporary dancer with fluid transfers and expressive reach",
    tempo: "slow",
    genre: "dance",
    mood: "calm",
  },
  {
    id: "s13",
    name: "Sprint Start",
    description: "Explosive starts and high cadence acceleration.",
    styleText: "track sprinter with explosive launch mechanics and strong drive",
    tempo: "fast",
    genre: "sports",
    mood: "focused",
  },
  {
    id: "s14",
    name: "Field Athlete",
    description: "Lateral cuts and balance-aware transitions.",
    styleText: "field athlete with lateral cuts and stabilized contact transitions",
    tempo: "mid",
    genre: "sports",
    mood: "focused",
  },
  {
    id: "s15",
    name: "Precision Goalkeeper",
    description: "Ready stance, micro-steps, reactive dives.",
    styleText: "goalkeeper ready stance with reactive micro-footwork and dives",
    tempo: "mid",
    genre: "sports",
    mood: "tense",
  },
  {
    id: "s16",
    name: "Heavy Brute",
    description: "Massive inertia and delayed recoveries.",
    styleText: "heavy brute with large momentum and forceful weighted steps",
    tempo: "slow",
    genre: "combat",
    mood: "aggressive",
  },
  {
    id: "s17",
    name: "Agile Scout",
    description: "Quick checks, light contacts, evasive footwork.",
    styleText: "agile scout with quick checks and evasive directional changes",
    tempo: "fast",
    genre: "stealth",
    mood: "focused",
  },
  {
    id: "s18",
    name: "Nervous Lookout",
    description: "Frequent glances, unsettled pacing.",
    styleText: "nervous lookout with unsettled pacing and frequent reorientation",
    tempo: "mid",
    genre: "cinematic",
    mood: "tense",
  },
  {
    id: "s19",
    name: "Relaxed Walker",
    description: "Loose shoulders and soft contact timing.",
    styleText: "relaxed walk with loose shoulders and soft heel-to-toe cadence",
    tempo: "slow",
    genre: "sports",
    mood: "calm",
  },
  {
    id: "s20",
    name: "Energy Burst",
    description: "Rapid combos with punchy stop-start cadence.",
    styleText: "bursty combo mover with high-energy stop-start cadence",
    tempo: "fast",
    genre: "dance",
    mood: "aggressive",
  },
  {
    id: "s21",
    name: "Martial Kata",
    description: "Structured beats and precise limb checkpoints.",
    styleText: "martial kata performer with precise checkpoints and formal rhythm",
    tempo: "mid",
    genre: "combat",
    mood: "focused",
  },
  {
    id: "s22",
    name: "Rogue Dash",
    description: "Short explosive dashes and low-profile turns.",
    styleText: "rogue dash style with short bursts and low-profile turns",
    tempo: "fast",
    genre: "stealth",
    mood: "aggressive",
  },
  {
    id: "s23",
    name: "Combat Drill",
    description: "Loop-ready practice rhythm with clean resets.",
    styleText: "drill-focused combat movement with clean reset timing",
    tempo: "mid",
    genre: "combat",
    mood: "focused",
  },
  {
    id: "s24",
    name: "Rhythm Fighter",
    description: "Dance-driven strikes and beat-matched recovery.",
    styleText: "rhythm fighter blending beat timing with strike transitions",
    tempo: "fast",
    genre: "dance",
    mood: "playful",
  },
  {
    id: "s25",
    name: "Calm Navigator",
    description: "Survey-first movement with long pauses.",
    styleText: "calm navigator with survey pauses and deliberate pathing",
    tempo: "slow",
    genre: "cinematic",
    mood: "calm",
  },
  {
    id: "s26",
    name: "Anxious Escape",
    description: "Uneven cadence and urgent directional shifts.",
    styleText: "anxious runner with uneven cadence and urgent escape pivots",
    tempo: "fast",
    genre: "cinematic",
    mood: "tense",
  },
  {
    id: "s27",
    name: "Rebound Athlete",
    description: "Springy return motion and quick stance recovery.",
    styleText: "rebound athlete with spring-loaded recoveries and stance resets",
    tempo: "mid",
    genre: "sports",
    mood: "focused",
  },
  {
    id: "s28",
    name: "Playful Skipper",
    description: "Light hops and asymmetrical timing accents.",
    styleText: "playful skipper with light hops and asymmetrical timing",
    tempo: "mid",
    genre: "dance",
    mood: "playful",
  },
  {
    id: "s29",
    name: "Defensive Retreat",
    description: "Backward checks and shielded torso alignment.",
    styleText: "defensive retreat with backward checks and guarded alignment",
    tempo: "slow",
    genre: "combat",
    mood: "tense",
  },
  {
    id: "s30",
    name: "Champion Entry",
    description: "Staged entrance with camera-aware beats.",
    styleText: "champion entrance with staged beats and camera-aware timing",
    tempo: "slow",
    genre: "cinematic",
    mood: "focused",
  },
  {
    id: "s31",
    name: "Close Quarters",
    description: "Compact range control and precise pivots.",
    styleText: "close-quarters fighter with compact range control and precision pivots",
    tempo: "mid",
    genre: "combat",
    mood: "aggressive",
  },
  {
    id: "s32",
    name: "Tactical Jog",
    description: "Operational pace with environmental scanning.",
    styleText: "tactical jog with environmental scans and disciplined posture",
    tempo: "mid",
    genre: "sports",
    mood: "focused",
  },
  {
    id: "s33",
    name: "Glide Spin",
    description: "Dance spin entries with stable exits.",
    styleText: "dance glide with spin entries and stable landing exits",
    tempo: "fast",
    genre: "dance",
    mood: "playful",
  },
  {
    id: "s34",
    name: "Quiet Sweep",
    description: "Smooth lateral sweeps and low-noise contacts.",
    styleText: "quiet sweep movement with smooth lateral coverage and low-noise steps",
    tempo: "slow",
    genre: "stealth",
    mood: "calm",
  },
  {
    id: "s35",
    name: "Panic Burst",
    description: "Unstable acceleration and hurried resets.",
    styleText: "panic burst with unstable acceleration and hurried reset steps",
    tempo: "fast",
    genre: "cinematic",
    mood: "tense",
  },
  {
    id: "s36",
    name: "Measured Patrol",
    description: "Consistent patrol pace with controlled turns.",
    styleText: "measured patrol with consistent pacing and controlled turn checks",
    tempo: "slow",
    genre: "stealth",
    mood: "focused",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onApplyStyle: (styleText: string) => void;
};

export function StylesLibraryModal({ open, onOpenChange, onApplyStyle }: Props) {
  const [query, setQuery] = useState("");
  const [tempoFilter, setTempoFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return STYLE_SEEDS.filter((style) => {
      const queryMatch =
        !normalized ||
        style.name.toLowerCase().includes(normalized) ||
        style.description.toLowerCase().includes(normalized) ||
        style.styleText.toLowerCase().includes(normalized);
      const tempoMatch = tempoFilter === "all" || style.tempo === tempoFilter;
      const genreMatch = genreFilter === "all" || style.genre === genreFilter;
      const moodMatch = moodFilter === "all" || style.mood === moodFilter;
      return queryMatch && tempoMatch && genreMatch && moodMatch;
    });
  }, [genreFilter, moodFilter, query, tempoFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Motion style library</DialogTitle>
          <DialogDescription>Search and apply style fingerprints to the demo.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search styles..."
              className="h-11 w-full rounded-2xl border border-white/15 bg-[#070b1d]/80 pl-10 pr-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/70"
            />
          </label>

          <Select value={tempoFilter} onValueChange={setTempoFilter}>
            <SelectTrigger className="min-w-[120px]">
              <SelectValue placeholder="tempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all tempos</SelectItem>
              <SelectItem value="slow">slow</SelectItem>
              <SelectItem value="mid">mid</SelectItem>
              <SelectItem value="fast">fast</SelectItem>
            </SelectContent>
          </Select>

          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all genres</SelectItem>
              <SelectItem value="combat">combat</SelectItem>
              <SelectItem value="cinematic">cinematic</SelectItem>
              <SelectItem value="dance">dance</SelectItem>
              <SelectItem value="sports">sports</SelectItem>
              <SelectItem value="stealth">stealth</SelectItem>
            </SelectContent>
          </Select>

          <Select value={moodFilter} onValueChange={setMoodFilter}>
            <SelectTrigger className="min-w-[130px]">
              <SelectValue placeholder="mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all moods</SelectItem>
              <SelectItem value="aggressive">aggressive</SelectItem>
              <SelectItem value="calm">calm</SelectItem>
              <SelectItem value="playful">playful</SelectItem>
              <SelectItem value="tense">tense</SelectItem>
              <SelectItem value="focused">focused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-[58vh] overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((style) => (
              <div
                key={style.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_0_20px_rgba(139,92,246,0.08)]"
              >
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge className="text-[10px] uppercase">{style.tempo}</Badge>
                  <Badge className="text-[10px] uppercase">{style.genre}</Badge>
                  <Badge className="text-[10px] uppercase">{style.mood}</Badge>
                </div>
                <p className="text-sm font-semibold text-white">{style.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">{style.description}</p>
                <p className="mt-2 text-xs font-mono text-white/55">{style.styleText}</p>
                <Button
                  size="sm"
                  className="mt-3 min-h-10 w-full"
                  onClick={() => {
                    playBleep();
                    onApplyStyle(style.styleText);
                    onOpenChange(false);
                  }}
                >
                  apply style
                </Button>
              </div>
            ))}
          </div>

          {!filtered.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-center text-sm text-white/60">
              No styles match your filters.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
