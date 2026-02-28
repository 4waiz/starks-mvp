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
    <section
      id="proof"
      className="section-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="mb-8 sm:mb-10"
      >
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">What you get</p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
          Production-grade motion output in a single control panel.
        </h2>
      </motion.div>

      <Card className="relative overflow-hidden rounded-[2rem] p-4 sm:p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(139,92,246,0.2),transparent_45%),radial-gradient(circle_at_90%_100%,rgba(217,70,239,0.15),transparent_42%)]" />
        <div className="relative overflow-x-auto pb-1">
          <div className="grid min-w-[720px] gap-6 md:gap-8 lg:min-w-0 lg:grid-cols-[1.2fr_1fr]">
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
              <Button variant="secondary" className="h-11 w-full gap-2 sm:w-auto">
                <Download className="h-4 w-4" />
                export fbx
              </Button>
              <Button variant="secondary" className="h-11 w-full gap-2 sm:w-auto">
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.14),transparent_48%),linear-gradient(150deg,rgba(43,43,66,0.95),rgba(8,10,20,0.96))]">
                  <div className="absolute inset-0 grid grid-cols-7 gap-px opacity-15">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <span key={i} className="bg-white/10" />
                    ))}
                  </div>

                  <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    manual pass
                  </div>

                  <div className="absolute left-[66%] top-[20%]">
                    <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-white/60 bg-white/5" />
                    <div className="absolute left-1/2 top-3.5 h-10 w-[2px] -translate-x-1/2 bg-white/50" />
                    <div className="absolute left-[47%] top-7 h-[2px] w-7 -translate-x-full bg-white/50" />
                    <div className="absolute left-[53%] top-7 h-[2px] w-7 bg-white/50" />
                    <div className="absolute left-[49%] top-12 h-[2px] w-5 -translate-x-full rotate-45 bg-white/45" />
                    <div className="absolute left-[51%] top-12 h-[2px] w-5 -rotate-45 bg-white/45" />
                    <div className="absolute left-[47%] top-[4.25rem] h-[2px] w-8 -translate-x-full rotate-[70deg] bg-[#f87171]/55" />
                    <div className="absolute left-[53%] top-[4.25rem] h-[2px] w-8 -rotate-[62deg] bg-[#f87171]/40" />
                  </div>

                  <div className="absolute inset-x-5 bottom-5">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                      contact drift variance
                    </div>
                    <div className="flex h-8 items-end gap-1 rounded-lg border border-white/10 bg-black/35 px-2 pb-1.5 pt-1">
                      {[35, 62, 28, 74, 55, 39, 71, 22, 58, 44, 69, 33].map((h, idx) => (
                        <span
                          key={h + idx}
                          style={{ height: `${h}%` }}
                          className="w-full rounded-sm bg-gradient-to-t from-[#f87171]/55 to-white/35"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                  <div className="h-full w-full bg-[radial-gradient(circle_at_60%_20%,rgba(139,92,246,0.45),transparent_45%),radial-gradient(circle_at_35%_70%,rgba(217,70,239,0.35),transparent_48%),linear-gradient(120deg,rgba(11,17,34,0.9),rgba(3,6,16,0.92))]">
                    <div className="absolute inset-0 grid grid-cols-7 gap-px opacity-20">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <span key={i} className="bg-[#c4b5fd]/10" />
                      ))}
                    </div>

                    <div className="absolute left-4 top-4 rounded-full border border-[#22d3ee]/40 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c7f9ff]">
                      starks generated
                    </div>

                    <motion.div
                      className="absolute right-8 top-10 h-16 w-16 rounded-full border border-[#22d3ee]/30"
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <div className="absolute inset-2 rounded-full border border-[#d946ef]/40" />
                      <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22d3ee]" />
                    </motion.div>

                    <div className="absolute left-[35%] top-[20%]">
                      <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-[#e9ddff] bg-[#d946ef]/25" />
                      <div className="absolute left-1/2 top-3.5 h-10 w-[2px] -translate-x-1/2 bg-[#e9ddff]" />
                      <div className="absolute left-[47%] top-7 h-[2px] w-7 -translate-x-full bg-[#d3c2ff]" />
                      <div className="absolute left-[53%] top-7 h-[2px] w-7 bg-[#d3c2ff]" />
                      <div className="absolute left-[49%] top-12 h-[2px] w-5 -translate-x-full rotate-45 bg-[#c4b5fd]" />
                      <div className="absolute left-[51%] top-12 h-[2px] w-5 -rotate-45 bg-[#c4b5fd]" />
                      <div className="absolute left-[47%] top-[4.25rem] h-[2px] w-8 -translate-x-full rotate-[66deg] bg-[#22d3ee]" />
                      <div className="absolute left-[53%] top-[4.25rem] h-[2px] w-8 -rotate-[66deg] bg-[#22d3ee]" />
                    </div>

                    <div className="absolute inset-x-5 bottom-5">
                      <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
                        contact stability
                      </div>
                      <div className="flex h-8 items-end gap-1 rounded-lg border border-white/10 bg-black/35 px-2 pb-1.5 pt-1">
                        {[18, 24, 20, 28, 23, 19, 26, 16, 22, 24, 20, 18].map((h, idx) => (
                          <span
                            key={h + idx}
                            style={{ height: `${h}%` }}
                            className="w-full rounded-sm bg-gradient-to-t from-[#22d3ee]/80 to-[#d946ef]/80"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
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
        </div>
      </Card>
    </section>
  );
}
