"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
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

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(3,7,20,0.88)" : "rgba(3,7,20,0.4)",
            boxShadow: isScrolled
              ? "0px 10px 40px rgba(2,6,23,0.55)"
              : "0px 0px 0px rgba(0,0,0,0)",
            borderColor: isScrolled
              ? "rgba(255,255,255,0.16)"
              : "rgba(255,255,255,0.08)",
          }}
          transition={{ duration: 0.25 }}
          className="glass-panel flex items-center justify-between rounded-full border px-4 py-2.5 backdrop-blur-xl md:px-6"
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

          <Button asChild size="sm">
            <a href="#contact">request access</a>
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
