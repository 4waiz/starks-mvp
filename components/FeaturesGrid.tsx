"use client";

import { useEffect, useState } from "react";
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
    copy: "Learns a performer signature from a single minute.",
  },
  {
    icon: CircleGauge,
    title: "controllable generation",
    copy: "Steer tempo and intent from compact text controls.",
  },
  {
    icon: ContactRound,
    title: "contact-aware cleanup",
    copy: "Auto-locks contacts to remove drift and bad landings.",
  },
  {
    icon: AppWindow,
    title: "retarget to any humanoid rig",
    copy: "One retarget pass for custom humanoid rigs.",
  },
  {
    icon: FileArchive,
    title: "fbx/bvh export",
    copy: "Production-ready files for direct engine ingest.",
  },
  {
    icon: ShieldCheck,
    title: "licensing vault (consent + rev share)",
    copy: "Consent records and rev-share rails built in.",
  },
];

export function FeaturesGrid() {
  const reduceMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();

    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="features"
      className="section-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mb-10 sm:mb-12">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Core features</p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
          Built for fast motion production.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:grid-cols-3">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.06, duration: 0.42 }}
            whileHover={
              reduceMotion || !canHover
                ? {}
                : {
                    y: -6,
                    rotateX: 4,
                    rotateY: idx % 2 === 0 ? -3 : 3,
                  }
            }
            whileTap={!canHover ? { scale: 0.985 } : undefined}
            style={{ perspective: 1200 }}
          >
            <Card className="feature-card relative h-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-5 sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,0.2),transparent_42%)] opacity-70" />
              <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <feature.icon className="h-5 w-5 text-[#d5beff]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-white/75">{feature.copy}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
