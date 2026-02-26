"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useInstitutions } from "@/lib/queries/institutions";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

type Tab = "UNIVERSITY" | "SCHOOL";

export function ExploreFeed() {
  const [activeTab, setActiveTab] = useState<Tab>("UNIVERSITY");
  const { data: institutions, isLoading } = useInstitutions();

  const filteredInstitutions = (institutions ?? []).filter(
    (inst) => inst.type === activeTab
  );

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-8 relative z-10">
        <div className="container mx-auto max-w-[1200px]">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-8 w-64 bg-zinc-800 rounded" />
              </div>
              <div className="h-10 w-48 bg-zinc-800 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 bg-zinc-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="explore" className="py-20 px-4 sm:px-8 relative z-10">
      <div className="container mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent mb-2 block">Instituicoes</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-balance">
              Explore por Instituicao
            </h2>
          </div>

          {/* Tabs - industrial style */}
          <div className="flex border border-border">
            <button
              onClick={() => setActiveTab("UNIVERSITY")}
              className={cn(
                "px-6 py-2.5 text-sm font-semibold transition-all duration-200 relative",
                activeTab === "UNIVERSITY"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              Faculdades
            </button>
            <button
              onClick={() => setActiveTab("SCHOOL")}
              className={cn(
                "px-6 py-2.5 text-sm font-semibold transition-all duration-200 relative border-l border-border",
                activeTab === "SCHOOL"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              Escolas
            </button>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredInstitutions.map((inst, i) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/instituicoes/${inst.id}`}>
                  <GlassCard className="h-full group flex flex-col justify-between">
                    {/* Hover scan line */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-start justify-between mb-6">
                      <div className="relative w-14 h-14 overflow-hidden bg-white border border-white/10 flex items-center justify-center p-2">
                        <Image
                          src={inst.logoUrl}
                          alt={inst.name}
                          fill
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div className="p-2 border border-border text-muted-foreground group-hover:border-brand-accent/40 group-hover:text-brand-accent transition-colors">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-sans font-bold mb-1 group-hover:text-brand-accent transition-colors">
                        {inst.shortName}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{inst.city}</p>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
