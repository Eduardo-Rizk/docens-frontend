"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function Hero() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f8f9fa] via-white to-[#f8f9fa]" />

      <ContainerScroll
        titleComponent={
          <div className="space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-[#0f172a]">
              {isLoggedIn ? (
                <>
                  Olá, {firstName}. <br />
                  <span className="text-[#ea580c]">Vamos para o próximo aulão?</span>
                </>
              ) : (
                <>
                  Aprenda com quem já passou <br />
                  <span className="text-[#ea580c]">pelo que você está vivendo.</span>
                </>
              )}
            </h1>

            <p className="text-base md:text-lg text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
              {isLoggedIn
                ? "Seu perfil está pronto. Explore recomendações alinhadas às suas instituições e matérias."
                : "Conecte-se com mentores experientes para mentorias e aulões ao vivo. Pague por aula, sem compromisso."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/explorar"
                className="group relative px-7 py-3.5 bg-[#ea580c] text-white font-semibold text-sm transition-all hover:bg-[#c2410c] active:scale-[0.98] flex items-center justify-center gap-2 rounded-lg"
              >
                <span>Explorar Aulas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={isLoggedIn ? "/aluno/perfil" : "/cadastro"}
                className="px-7 py-3.5 border border-[#d1d5db] text-[#0f172a] font-semibold text-sm hover:bg-[#f3f4f6] transition-all flex items-center justify-center active:scale-[0.98] rounded-lg"
              >
                {isLoggedIn ? "Ajustar meu perfil" : "Criar conta"}
              </Link>
            </div>

            {/* Value props */}
            <div className="flex flex-wrap gap-2 pt-2 justify-center">
              {["Ao vivo", "Pague por aula", "Professores verificados"].map((prop) => (
                <span
                  key={prop}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#6b7280]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#ea580c]" />
                  {prop}
                </span>
              ))}
            </div>
          </div>
        }
      >
        {/* Platform Mockup inside the animated card */}
        <PlatformMockup />
      </ContainerScroll>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fa] to-transparent" />
    </section>
  );
}

/* ── Platform Dashboard Mockup ── */
function PlatformMockup() {
  return (
    <div className="h-full w-full bg-[#f8f9fa] p-3 md:p-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm md:text-base text-[#0f172a]">docsens</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4 text-xs text-[#6b7280] mr-4">
            <span className="hover:text-[#0f172a] cursor-pointer">Explorar</span>
            <span className="hover:text-[#0f172a] cursor-pointer">Meus Auloes</span>
            <span className="hover:text-[#0f172a] cursor-pointer">Agenda</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#ea580c] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">DR</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg">
          <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs text-[#9ca3af]">Buscar auloes, professores, instituicoes...</span>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="font-display font-bold text-xs md:text-sm text-[#0f172a]">Proximos Auloes</h3>
        <span className="text-[10px] md:text-xs text-[#ea580c] font-medium cursor-pointer">Ver todos</span>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <ClassCard
          title="Calculo Intensivo"
          institution="INSPER"
          teacher="Prof. Marina S."
          price="R$ 149"
          spots="12/50"
          time="Seg, 19h"
          color="#0f172a"
          live
        />
        <ClassCard
          title="Direito Constitucional"
          institution="Mackenzie"
          teacher="Prof. Carlos R."
          price="R$ 89"
          spots="34/40"
          time="Ter, 20h"
          color="#1e40af"
          live={false}
        />
        <ClassCard
          title="Anatomia Humana"
          institution="Einstein"
          teacher="Prof. Ana L."
          price="R$ 199"
          spots="8/30"
          time="Qua, 18h"
          color="#7c3aed"
          live={false}
        />
      </div>
    </div>
  );
}

function ClassCard({
  title,
  institution,
  teacher,
  price,
  spots,
  time,
  color,
  live,
}: {
  title: string;
  institution: string;
  teacher: string;
  price: string;
  spots: string;
  time: string;
  color: string;
  live: boolean;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-3 md:p-4 space-y-2.5 hover:border-[#d1d5db] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "12" }}
        >
          <BookOpen size={14} style={{ color }} />
        </div>
        {live && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[9px] font-bold text-red-600">
            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <h4 className="font-display font-bold text-xs md:text-sm text-[#0f172a] leading-tight">{title}</h4>
        <p className="text-[10px] md:text-xs text-[#6b7280] mt-0.5">{teacher}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-[#f3f4f6] text-[#0f172a] font-medium rounded border border-[#e5e7eb]">
          {institution}
        </span>
        <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-[#f3f4f6] text-[#6b7280] font-medium rounded border border-[#e5e7eb] flex items-center gap-0.5">
          <Users size={8} />
          {spots}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#f3f4f6]">
        <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#6b7280]">
          <Clock size={10} />
          <span>{time}</span>
        </div>
        <span className="font-display font-bold text-xs md:text-sm text-[#ea580c]">{price}</span>
      </div>
    </div>
  );
}
