"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AppWindow,
  CircleGauge,
  ContactRound,
  FileArchive,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Fingerprint,
    title: "kinetic identity cloning (60s)",
    copy: "Learns movement signature from one minute of source footage.",
  },
  {
    icon: CircleGauge,
    title: "controllable generation",
    copy: "Drive tempo, intensity, and action combinations from text controls.",
  },
  {
    icon: ContactRound,
    title: "contact-aware cleanup",
    copy: "Auto-constrains feet and hands to eliminate drift and bad contacts.",
  },
  {
    icon: AppWindow,
    title: "retarget to any humanoid rig",
    copy: "Unified retarget pass for custom rigs in real-time pipelines.",
  },
  {
    icon: FileArchive,
    title: "fbx/bvh export",
    copy: "One-click export for production scenes and engine ingestion.",
  },
  {
    icon: ShieldCheck,
    title: "licensing vault (consent + rev share)",
    copy: "Identity ownership, approvals, and payout rails built in by default.",
  },
];

export function FeaturesGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="section-shell mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Core features</p>
        <h2 className="max-w-3xl text-3xl font-semibold text-white md:text-4xl">
          Everything needed to clone movement identity and ship motion fast.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.06, duration: 0.42 }}
            whileHover={
              reduceMotion
                ? {}
                : {
                    y: -6,
                    rotateX: 4,
                    rotateY: idx % 2 === 0 ? -3 : 3,
                  }
            }
            style={{ perspective: 1200 }}
          >
            <Card className="feature-card relative h-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,0.2),transparent_42%)] opacity-70" />
              <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <feature.icon className="h-5 w-5 text-[#d5beff]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{feature.copy}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
