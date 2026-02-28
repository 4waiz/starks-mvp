"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cpu, Download, Film, Fingerprint, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AppMockWindow() {
  const [slider, setSlider] = useState(56);
  const reduceMotion = useReducedMotion();

  return (
    <section id="proof" className="section-shell mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="mb-10"
      >
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">What you get</p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          Production-grade motion output in a single control panel.
        </h2>
      </motion.div>

      <Card className="relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(139,92,246,0.2),transparent_45%),radial-gradient(circle_at_90%_100%,rgba(217,70,239,0.15),transparent_42%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="neon" className="shimmer px-3 py-1.5">
                starks processing...
              </Badge>
              <Badge>style fingerprint v2.3</Badge>
              <Badge variant="cyan">retarget-ready</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                  <Timer className="h-4 w-4 text-[#22d3ee]" />
                  Timeline
                </div>
                <div className="space-y-2">
                  {[28, 62, 48, 84].map((w, idx) => (
                    <div key={w} className="h-2 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                  <Fingerprint className="h-4 w-4 text-[#d946ef]" />
                  Style Fingerprint
                </div>
                <div className="flex flex-wrap gap-2">
                  {["sharp_stops", "light_footed", "center_bias", "combo_ready"].map((chip) => (
                    <Badge key={chip} className="font-mono text-[10px] tracking-wide">
                      {chip}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                <Cpu className="h-4 w-4 text-[#8b5cf6]" />
                Skeleton Preview
              </div>
              <div className="relative h-40 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(139,92,246,0.15),rgba(4,8,22,0.7))]">
                <div className="absolute inset-0 grid grid-cols-6 gap-[1px] opacity-35">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <span key={i} className="bg-white/[0.04]" />
                  ))}
                </div>
                <div className="absolute left-1/2 top-7 h-4 w-4 -translate-x-1/2 rounded-full border border-white/70" />
                <div className="absolute left-1/2 top-11 h-12 w-[2px] -translate-x-1/2 bg-white/70" />
                <div className="absolute left-[42%] top-[35%] h-[2px] w-[16%] bg-white/70" />
                <div className="absolute left-[39%] top-[52%] h-[2px] w-[10%] rotate-45 bg-white/70" />
                <div className="absolute right-[39%] top-[52%] h-[2px] w-[10%] -rotate-45 bg-white/70" />
                <div className="absolute left-[37%] top-[63%] h-[2px] w-[14%] rotate-[66deg] bg-white/70" />
                <div className="absolute right-[37%] top-[63%] h-[2px] w-[14%] -rotate-[66deg] bg-white/70" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" />
                export fbx
              </Button>
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" />
                export bvh
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Before / after viewer</p>
              <Badge>
                <Film className="mr-1 h-3 w-3" />
                manual vs starks
              </Badge>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
              <div className="relative aspect-[4/5]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.14),transparent_48%),linear-gradient(150deg,rgba(43,43,66,0.95),rgba(8,10,20,0.96))]" />
                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                  <div className="h-full w-full bg-[radial-gradient(circle_at_60%_20%,rgba(139,92,246,0.45),transparent_45%),radial-gradient(circle_at_35%_70%,rgba(217,70,239,0.35),transparent_48%),linear-gradient(120deg,rgba(11,17,34,0.9),rgba(3,6,16,0.92))]" />
                </div>
                <div
                  className="absolute inset-y-0 z-10 w-[2px] bg-[#22d3ee] shadow-[0_0_18px_rgba(34,211,238,0.85)]"
                  style={{ left: `${slider}%` }}
                />
                <div
                  className="absolute top-3 z-10 rounded-full border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75"
                  style={{ left: `calc(${slider}% - 28px)` }}
                >
                  split
                </div>
              </div>
              <div className="border-t border-white/10 px-4 py-4">
                <input
                  aria-label="Before and after slider"
                  type="range"
                  min={0}
                  max={100}
                  value={slider}
                  onChange={(event) => setSlider(Number(event.target.value))}
                  className="w-full accent-[#22d3ee]"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
