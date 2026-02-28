"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function useCountUp(target: number, shouldStart: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    let frame = 0;
    const totalFrames = Math.max(1, Math.round(durationMs / 16));

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [durationMs, shouldStart, target]);

  return value;
}

export function Metrics() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const pipeline = useCountUp(4, inView, 1200);
  const minutes = useCountUp(14, inView, 1400);
  const days = useCountUp(3, inView, 1400);

  return (
    <section id="impact" className="section-shell mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        ref={ref}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="grid gap-6 lg:grid-cols-[1.25fr_1fr]"
      >
        <Card className="relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(34,211,238,0.12),transparent_46%),radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.2),transparent_50%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Quantified impact</p>
            <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {pipeline}x faster animation pipeline
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">
              From capture to engine-ready clips in minutes, not days.
            </p>

            <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                  <span>Traditional mocap pass</span>
                  <span>{days} days</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-white/35"
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                  <span>Starks generation pass</span>
                  <span>{minutes} minutes</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#22d3ee]"
                    initial={{ width: 0 }}
                    whileInView={{ width: "24%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.15 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Quality checks</p>
          <div className="mt-5 grid gap-3">
            {["no foot sliding", "clean contacts", "retarget-ready", "stable timing"].map((item, idx) => (
              <motion.div
                key={item}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 14 }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.32 }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <span className="text-sm text-white/85">{item}</span>
                <Badge variant={idx === 3 ? "cyan" : "default"}>pass</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
