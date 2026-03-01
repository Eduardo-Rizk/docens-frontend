"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight } from "lucide-react";
import { useInstitutions } from "@/lib/queries/institutions";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

type Tab = "ALL" | "UNIVERSITY" | "SCHOOL";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<Tab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: institutions, isLoading } = useInstitutions();

  const filteredInstitutions = (institutions ?? []).filter((inst) => {
    if (activeTab !== "ALL" && inst.type !== activeTab) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        inst.name.toLowerCase().includes(query) ||
        inst.shortName.toLowerCase().includes(query) ||
        inst.city.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4 sm:px-8">

        {/* Header & Search */}
        <div className="max-w-2xl mx-auto text-center mb-12 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display font-bold"
          >
            Explore o Conhecimento
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Encontre escolas e faculdades de elite para alavancar sua carreira.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome da instituicao..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface border border-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
            />
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-12">
          <div className="flex border border-border bg-surface">
            {[
              { id: "ALL", label: "Todas" },
              { id: "UNIVERSITY", label: "Faculdades" },
              { id: "SCHOOL", label: "Escolas" },
            ].map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "px-6 py-2.5 text-sm font-semibold transition-all duration-200 relative",
                  i > 0 && "border-l border-[#d1d5db]",
                  activeTab === tab.id
                    ? "text-white"
                    : "text-[#6b7280] hover:text-[#0f172a]"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-filter-tab"
                    className="absolute inset-0 bg-[#0f172a] rounded-md"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[220px] bg-[#d1d5db] rounded-md" />
            ))}
          </div>
        )}

        {/* Grid Results */}
        {!isLoading && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredInstitutions.map((inst) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/instituicoes/${inst.id}`}>
                    <GlassCard className="h-full group flex flex-col justify-between overflow-hidden relative min-h-[220px]">
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white p-2 shadow-inner">
                          <Image
                            src={inst.logoUrl}
                            alt={inst.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="p-2 rounded-full border border-border text-muted-foreground group-hover:border-brand-accent group-hover:text-brand-accent transition-colors duration-200">
                          <ArrowUpRight size={20} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-display font-bold mb-2 group-hover:text-brand-accent transition-colors duration-200">
                          {inst.shortName}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{inst.name}</p>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredInstitutions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20 text-muted-foreground"
              >
                <p className="text-xl">Nenhuma instituicao encontrada.</p>
                <button
                  onClick={() => {setSearchQuery(""); setActiveTab("ALL")}}
                  className="mt-4 text-brand-primary underline hover:text-brand-accent"
                >
                  Limpar filtros
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
