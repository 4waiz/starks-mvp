"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Command, FolderKanban, Menu, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getSoundEnabled,
  initializeSound,
  onSoundPreferenceChange,
  playBleep,
  setSoundEnabled as persistSoundEnabled,
} from "@/lib/sound";
import { emitOpenCommandPalette, emitOpenProjectsDrawer } from "@/lib/hotkeys";
import { cn } from "@/lib/utils";

const links = [
  { id: "home", label: "Home" },
  { id: "how-it-works", label: "How it works" },
  { id: "demo", label: "Demo" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export function SiteHeader() {
  const [activeId, setActiveId] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const observerIds = useMemo(() => links.map((link) => link.id), []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 14);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    initializeSound();
    setSoundEnabled(getSoundEnabled());

    const unsubscribe = onSoundPreferenceChange((enabled) => {
      setSoundEnabled(enabled);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const sections = observerIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [observerIds]);

  const onToggleSound = () => {
    const next = !soundEnabled;
    persistSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      playBleep();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(3,7,20,0.9)" : "rgba(3,7,20,0.4)",
            boxShadow: isScrolled
              ? "0px 10px 40px rgba(2,6,23,0.55)"
              : "0px 0px 0px rgba(0,0,0,0)",
            borderColor: isScrolled
              ? "rgba(255,255,255,0.16)"
              : "rgba(255,255,255,0.08)",
          }}
          transition={{ duration: 0.25 }}
          className="glass-panel flex items-center justify-between rounded-full border px-3 py-2.5 backdrop-blur-xl sm:px-4 md:px-6"
        >
          <a href="#home" className="flex items-center gap-2 text-sm font-semibold text-white">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#d946ef] to-[#22d3ee] shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="tracking-wide">starks ai</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                href={`#${link.id}`}
                key={link.id}
                className={cn(
                  "relative rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white",
                  activeId === link.id && "text-white",
                )}
              >
                {activeId === link.id ? (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 -z-10 rounded-full bg-white/15"
                    transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  />
                ) : null}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
              onClick={onToggleSound}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              sound
            </button>
            <button
              type="button"
              onClick={() => {
                playBleep();
                emitOpenCommandPalette();
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Command className="h-3.5 w-3.5" />
              cmd+k
            </button>
            <button
              type="button"
              onClick={() => {
                playBleep();
                emitOpenProjectsDrawer();
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              projects
            </button>
            <Button asChild size="sm">
              <a
                href="#contact"
                onClick={() => {
                  playBleep();
                }}
              >
                request access
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button asChild size="sm" className="h-10 px-4">
              <a
                href="#contact"
                onClick={() => {
                  playBleep();
                }}
              >
                request access
              </a>
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Access sections and quick controls.</SheetDescription>
                </SheetHeader>

                <div className="grid gap-2">
                  {links.map((link) => (
                    <SheetClose asChild key={link.id}>
                      <Link
                        href={`#${link.id}`}
                        className={cn(
                          "rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
                          activeId === link.id && "border-[#8b5cf6]/45 bg-[#8b5cf6]/15 text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playBleep();
                      emitOpenCommandPalette();
                      setMobileOpen(false);
                    }}
                    className="inline-flex min-h-11 items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-medium text-white/85"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Command className="h-4 w-4 text-[#d6c2ff]" />
                      command palette
                    </span>
                    <span className="text-xs uppercase tracking-[0.14em] text-white/55">cmd+k</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playBleep();
                      emitOpenProjectsDrawer();
                      setMobileOpen(false);
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-medium text-white/85"
                  >
                    <FolderKanban className="h-4 w-4 text-[#d6c2ff]" />
                    projects
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-3">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-white/60">preferences</p>
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className="inline-flex h-10 w-full items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
                  >
                    <span className="inline-flex items-center gap-2">
                      {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                      sound
                    </span>
                    <span className={cn("text-white/55", soundEnabled && "text-[#b5f9ff]")}>
                      {soundEnabled ? "on" : "off"}
                    </span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
