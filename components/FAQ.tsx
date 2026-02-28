"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const faqItems = [
  {
    q: "How do you keep generated motion quality high?",
    a: "Starks enforces contact constraints, anti-foot-sliding checks, and timing stabilization before export.",
  },
  {
    q: "Who owns the source performance data?",
    a: "Creators retain ownership. The licensing vault tracks consent terms and usage scopes in one place.",
  },
  {
    q: "What does licensing vault: consent + revenue share mean?",
    a: "Every identity can include permission state and payout routing, so licensed motion use has built-in accountability.",
  },
  {
    q: "Which engines are supported?",
    a: "Current focus is unreal, unity, and blender workflows with humanoid retargeting.",
  },
  {
    q: "Can I export both FBX and BVH?",
    a: "Yes. Exports are designed for production-ready ingest and quick retarget passes.",
  },
  {
    q: "How does pricing scale?",
    a: "Plans scale by performer count, generation volume, and enterprise-level control requirements.",
  },
  {
    q: "Is the roadmap focused on body-only animation?",
    a: "No. The roadmap includes facial identity transfer and multi-character interaction control.",
  },
  {
    q: "How much source footage is required?",
    a: "Starks is built to clone movement identity from 60 seconds of quality source footage.",
  },
];

export function FAQ() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="faq"
      className="section-shell mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
      >
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">FAQ</p>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">
            Answers for production teams.
          </h2>
        </div>
        <Card className="rounded-[2rem] border border-white/10 bg-black/30 px-4 sm:px-6 md:px-8">
          <Accordion type="single" collapsible>
            {faqItems.map((item, idx) => (
              <AccordionItem key={item.q} value={`item-${idx}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </motion.div>
    </section>
  );
}
