"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "creator",
    price: "$49/mo",
    description: "Solo experimentation and quick prototype exports.",
    features: ["2 performers", "200 generations/mo", "FBX/BVH export"],
    highlighted: false,
  },
  {
    name: "studio",
    price: "$299/mo",
    description: "Best for indie teams shipping animation-heavy pipelines.",
    features: [
      "10 performers",
      "2,000 generations/mo",
      "Priority generation queue",
      "Licensing vault included",
    ],
    highlighted: true,
  },
  {
    name: "enterprise",
    price: "custom",
    description: "Custom legal rails, private deployment, and SLAs.",
    features: ["Unlimited performers", "Dedicated model tuning", "Private cloud + SSO"],
    highlighted: false,
  },
];

export function Pricing() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="section-shell mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d6c2ff]/80">Pricing</p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">Scale from creator to studio pipeline.</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.name}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: idx * 0.08, duration: 0.42 }}
          >
            <Card
              className={cn(
                "h-full rounded-3xl p-6",
                tier.highlighted
                  ? "border-[#d946ef]/45 bg-[linear-gradient(180deg,rgba(139,92,246,0.25),rgba(5,8,24,0.94))] shadow-[0_0_40px_rgba(217,70,239,0.25)]"
                  : "border-white/10 bg-black/30",
              )}
            >
              {tier.highlighted ? (
                <Badge variant="neon" className="mb-4">
                  most popular
                </Badge>
              ) : (
                <div className="mb-4 h-6" />
              )}
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{tier.name}</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">{tier.price}</h3>
              <p className="mt-3 text-sm text-white/70">{tier.description}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#22d3ee]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full">
                <a href="#contact">request access</a>
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
