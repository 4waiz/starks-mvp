"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Radar } from "lucide-react";

import { AppMockWindow } from "@/components/AppMockWindow";
import { DemoPanel } from "@/components/DemoPanel";
import { FAQ } from "@/components/FAQ";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { Footer } from "@/components/Footer";
import { HeroHUD } from "@/components/HeroHUD";
import { HowItWorks } from "@/components/HowItWorks";
import { Metrics } from "@/components/Metrics";
import { ParticleField } from "@/components/ParticleField";
import { Pricing } from "@/components/Pricing";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const statuses = [
  { label: "capture", value: "ready", color: "bg-[#22d3ee]" },
  { label: "fingerprint", value: "standby", color: "bg-[#d946ef]" },
  { label: "generator", value: "online", color: "bg-[#8b5cf6]" },
  { label: "export", value: "fbx/bvh", color: "bg-white" },
];

const logos = ["unity", "unreal", "blender", "fbx", "bvh"];

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");

  return (
    <div className="noise-overlay relative">
      <ParticleField />
      <SiteHeader />

      <motion.main
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden pt-28"
      >
        <section id="home" className="section-shell mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 xl:grid-cols-[1fr_1.2fr_0.9fr]">
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Badge variant="cyan" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]">
                kinetic identity / motion generation
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
                welcome to the <span className="accent-italic gradient-text">future</span> of motion
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/75">
                clone movement identity -&gt; generate new actions -&gt; export fbx/bvh
              </p>

              <div className="grid gap-2 text-sm text-white/70">
                <p>clone movement identity from 60 seconds</p>
                <p>generate new actions in that exact style</p>
                <p>export fbx/bvh into unreal, unity, blender</p>
                <p>licensing vault: consent + revenue share</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href="#demo">
                    try live demo
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      <Play className="h-4 w-4" />
                      watch 20s preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Starks preview feed</DialogTitle>
                      <DialogDescription>
                        Mock autopreview loop of capture, fingerprint extraction, and generation output.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                      <motion.div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.45),transparent_40%),radial-gradient(circle_at_75%_70%,rgba(217,70,239,0.35),transparent_50%),linear-gradient(120deg,rgba(6,9,25,0.95),rgba(4,7,18,0.96))]"
                        animate={
                          reduceMotion
                            ? {}
                            : { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }
                        }
                        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                      <div className="absolute inset-4 grid grid-cols-12 gap-3">
                        <div className="relative col-span-8 overflow-hidden rounded-xl border border-white/15 bg-black/30">
                          <div className="absolute inset-0 grid grid-cols-7 gap-[1px] opacity-25">
                            {Array.from({ length: 56 }).map((_, i) => (
                              <span key={i} className="bg-white/10" />
                            ))}
                          </div>

                          <motion.div
                            className="absolute left-0 right-0 top-0 h-[2px] bg-[#22d3ee] shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                            animate={reduceMotion ? {} : { top: ["0%", "100%"] }}
                            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />

                          <div className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">
                            Frame 128
                          </div>

                          <div className="absolute right-2 top-2 rounded-full border border-[#22d3ee]/40 bg-black/55 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#c7f9ff]">
                            tracking lock
                          </div>

                          <div className="absolute left-[42%] top-[24%]">
                            <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full border border-[#e9ddff] bg-[#d946ef]/20" />
                            <div className="absolute left-1/2 top-3 h-8 w-[2px] -translate-x-1/2 bg-[#d3c2ff]" />
                            <div className="absolute left-[47%] top-6 h-[2px] w-5 -translate-x-full bg-[#d3c2ff]" />
                            <div className="absolute left-[53%] top-6 h-[2px] w-5 bg-[#d3c2ff]" />
                            <div className="absolute left-[49%] top-10 h-[2px] w-4 -translate-x-full rotate-45 bg-[#22d3ee]" />
                            <div className="absolute left-[51%] top-10 h-[2px] w-4 -rotate-45 bg-[#22d3ee]" />
                            <div className="absolute left-[47%] top-14 h-[2px] w-6 -translate-x-full rotate-[67deg] bg-[#22d3ee]" />
                            <div className="absolute left-[53%] top-14 h-[2px] w-6 -rotate-[67deg] bg-[#22d3ee]" />
                          </div>

                          <div className="absolute inset-x-3 bottom-2">
                            <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-white/55">
                              <span>pose timeline</span>
                              <span>00:14 / 00:20</span>
                            </div>
                            <div className="h-7 rounded-lg border border-white/10 bg-black/45 px-2 py-1">
                              <div className="flex h-full items-end gap-1">
                                {[28, 45, 22, 60, 34, 53, 26, 63, 29, 52, 32, 49].map((h, idx) => (
                                  <motion.span
                                    key={h + idx}
                                    className="w-full rounded-sm bg-gradient-to-t from-[#8b5cf6] via-[#d946ef] to-[#22d3ee]"
                                    animate={reduceMotion ? {} : { height: [`${h - 8}%`, `${h}%`, `${h - 5}%`] }}
                                    transition={{
                                      duration: 1.4 + idx * 0.03,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "easeInOut",
                                      delay: idx * 0.05,
                                    }}
                                    style={{ height: `${h}%` }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-4 grid gap-3">
                          <div className="rounded-xl border border-white/15 bg-black/35 p-2.5">
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">
                              pipeline
                            </p>
                            {[
                              { label: "capture", width: "92%" },
                              { label: "fingerprint", width: "78%" },
                              { label: "generate", width: "64%" },
                              { label: "export", width: "88%" },
                            ].map((row, idx) => (
                              <div key={row.label} className="mb-2 last:mb-0">
                                <div className="mb-1 flex justify-between text-[9px] uppercase tracking-[0.14em] text-white/55">
                                  <span>{row.label}</span>
                                  <span>{row.width}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee]"
                                    initial={{ width: 0 }}
                                    animate={{ width: row.width }}
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-xl border border-white/15 bg-black/35 p-2.5">
                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">
                              active clips
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {["jab_combo", "pivot_turn", "idle_guard", "sidestep"].map((clip, idx) => (
                                <div
                                  key={clip}
                                  className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/70"
                                >
                                  <span className="mr-1 text-[#22d3ee]">{idx + 1}.</span>
                                  {clip}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/5 px-2.5 py-2 text-[9px] uppercase tracking-[0.14em] text-[#c7f9ff]">
                            realtime quality checks: clean_contacts / stable_timing
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            <HeroHUD />

            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="glass-panel rounded-3xl border border-white/10 p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <Radar className="h-4 w-4 text-[#22d3ee]" />
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">system status</p>
              </div>
              <div className="space-y-3">
                {statuses.map((status, idx) => (
                  <div
                    key={status.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  >
                    <span className="text-white/80">{status.label}:</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`pulse-dot ${status.color}`}
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      />
                      <span className="text-white">{status.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <AppMockWindow />
        <Metrics />
        <FeaturesGrid />
        <HowItWorks />
        <DemoPanel />
        <Pricing />
        <FAQ />

        <section id="contact" className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-[2rem] border border-white/10 p-8 text-center md:p-10">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Request access</p>
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-white md:text-4xl">
              Join the early access waitlist for Starks AI.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
              Bring your motion team into a futuristic control room for identity cloning and generation.
            </p>

            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@studio.com"
                required
              />
              <Button type="submit" className="sm:w-auto">
                request access
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {logos.map((logo) => (
                <Badge key={logo} className="px-3 py-1.5 text-xs uppercase tracking-[0.14em]">
                  {logo}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </motion.main>
    </div>
  );
}
