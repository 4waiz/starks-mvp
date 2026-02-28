"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileUp, Fingerprint, Rocket } from "lucide-react";

import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: FileUp,
    title: "upload 60s video",
    body: "Drop a short reference clip and capture signal from every stride and contact.",
  },
  {
    icon: Fingerprint,
    title: "motion fingerprint extracted",
    body: "Starks maps rhythm, acceleration, and style micro-signatures into a kinetic profile.",
  },
  {
    icon: Rocket,
    title: "generate -> export -> drop into engine",
    body: "Generate variations and export directly for unreal, unity, or blender pipelines.",
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="section-shell mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mb-12">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">How it works</p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          Three steps from source movement to production-ready files.
        </h2>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-3">
        {steps.map((step, idx) => (
          <motion.div
            key={step.title}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: idx * 0.12, duration: 0.48 }}
            className="relative"
          >
            <Card className="h-full rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <step.icon className="h-5 w-5 text-[#d6c2ff]" />
              </div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                step {idx + 1}
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{step.body}</p>
            </Card>

            {idx < steps.length - 1 ? (
              <motion.div
                aria-hidden="true"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleX: 0.4 }}
                whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, scaleX: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: idx * 0.1 + 0.25, duration: 0.45 }}
                className="pointer-events-none absolute -right-4 top-1/2 hidden w-8 -translate-y-1/2 lg:flex"
              >
                <div className="h-[2px] w-full bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#22d3ee]" />
                <ArrowRight className="-ml-1 h-4 w-4 text-[#d5beff]" />
              </motion.div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
