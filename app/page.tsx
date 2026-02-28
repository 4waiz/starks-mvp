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
import { LiveTerminal } from "@/components/LiveTerminal";
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
import { playBleep } from "@/lib/sound";
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
  const [previewMissing, setPreviewMissing] = useState(false);

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
        <section id="home" className="section-shell mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
              <p className="max-w-2xl text-base leading-relaxed text-white/75">
                Clone movement identity from 60 seconds, generate new actions in that exact style, and export
                fbx/bvh into unreal, unity, blender.
              </p>

              <Badge className="w-fit border-[#d946ef]/40 bg-[#d946ef]/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#f2d4ff]">
                licensing vault: consent + revenue share
              </Badge>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a
                    href="#demo"
                    onClick={() => {
                      playBleep();
                    }}
                  >
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
                        10-second capture of the live demo pipeline.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black/50 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                        {!previewMissing ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls={false}
                            preload="metadata"
                            onError={() => setPreviewMissing(true)}
                            className="h-full w-full object-cover"
                          >
                            <source src="/preview/demo-loop.mp4" type="video/mp4" />
                          </video>
                        ) : (
                          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25),rgba(3,7,20,0.95)_68%)] p-6 text-center">
                            <div className="max-w-md">
                              <p className="text-base font-semibold text-white">preview video not added yet</p>
                              <p className="mt-2 text-sm text-white/70">
                                Add `public/preview/demo-loop.mp4` (10s, H.264 MP4) to enable this panel.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                        {!previewMissing ? (
                          <motion.div
                            className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-[#22d3ee] shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                            animate={reduceMotion ? {} : { top: ["0%", "100%"] }}
                            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        ) : null}
                      </div>

                      <div className="grid gap-2 text-xs text-white/65 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 uppercase tracking-[0.14em]">
                          capture -&gt; fingerprint
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 uppercase tracking-[0.14em]">
                          generate -&gt; cleanup
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 uppercase tracking-[0.14em]">
                          export fbx/bvh
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

        <LiveTerminal />
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
              <Button
                type="submit"
                className="sm:w-auto"
                onClick={() => {
                  playBleep();
                }}
              >
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
