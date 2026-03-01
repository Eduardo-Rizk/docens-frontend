"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Hero() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-8 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] -mx-6 sm:-mx-8 -mt-10 sm:-mt-14">
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#1e40af]/10 blur-[140px] -z-0 pointer-events-none" />

      <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 max-w-[1200px]">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8 text-center lg:text-left"
        >
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 bg-white/10 text-white text-xs font-semibold uppercase tracking-[0.15em] w-fit mx-auto lg:mx-0 rounded-md"
          >
            <Zap size={12} className="text-[#ea580c]" />
            <span>{isLoggedIn ? "Seu Hub de Estudos" : "Hub de Aprendizado"}</span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="block text-white">
              {isLoggedIn
                ? `Ola, ${firstName}. Vamos para o proximo aulao?`
                : "Aprenda com quem ja passou pelo que voce esta vivendo."}
            </span>
          </h1>

          <p className="text-lg text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            {isLoggedIn
              ? "Seu perfil esta pronto. Explore recomendacoes alinhadas as suas instituicoes e materias."
              : "Conecte-se com mentores experientes para mentorias e auloes ao vivo."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <Link
              href="/explorar"
              className="group relative px-7 py-3.5 bg-[#ea580c] text-white font-semibold text-sm transition-all hover:bg-[#c2410c] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden rounded-md"
            >
              <span className="relative z-10">Explorar Aulas</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={isLoggedIn ? "/aluno/perfil" : "/cadastro"}
              className="px-7 py-3.5 border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center active:scale-[0.98] rounded-md"
            >
              {isLoggedIn ? "Ajustar meu perfil" : "Criar conta"}
            </Link>
          </div>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-2 pt-4 justify-center lg:justify-start"
          >
            {[
              "Ao vivo",
              "Pague por aula",
              "Professores verificados",
            ].map((prop) => (
              <span
                key={prop}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60"
              >
                <span className="h-1 w-1 rounded-full bg-[#ea580c]" />
                {prop}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* 3D Book / Video Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-[420px] sm:h-[500px] w-full flex items-center justify-center"
        >
          <motion.div
            animate={{
              y: [0, -12, 0],
              rotateY: [0, 2, 0],
              rotateX: [0, -1, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
            style={{ perspective: "1000px" }}
          >
            {/* Book / Screen Container */}
            <div className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[420px]" style={{ transformStyle: "preserve-3d" }}>
              {/* Main face - Screen/Book */}
              <div className="absolute inset-0 bg-white border border-[#e2e8f0] rounded-lg shadow-2xl overflow-hidden" style={{ transform: "rotateY(-8deg) rotateX(2deg)", transformStyle: "preserve-3d" }}>
                {/* Screen content - video lesson mockup */}
                <div className="p-4 h-full flex flex-col">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-destructive rounded-full" />
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div className="flex-1" />
                    <div className="text-[10px] text-muted-foreground font-mono">LIVE</div>
                    <div className="w-1.5 h-1.5 bg-destructive animate-pulse rounded-full" />
                  </div>

                  {/* Video area */}
                  <div className="flex-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md flex items-center justify-center relative overflow-hidden">
                    {/* Play button */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 sm:w-16 sm:h-16 border border-[#0f172a]/40 rounded-full flex items-center justify-center"
                    >
                      <Play size={20} className="text-[#0f172a] ml-0.5" fill="currentColor" />
                    </motion.div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e5e7eb]">
                      <motion.div
                        animate={{ width: ["0%", "65%"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-[#0f172a]"
                      />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-[#0f172a]" />
                      <span className="text-xs font-medium text-foreground">Calculo Intensivo</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#0f172a]/10 text-[#0f172a] border border-[#0f172a]/20 font-medium rounded">INSPER</span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#f3f4f6] text-muted-foreground border border-[#d1d5db] font-medium rounded">50 vagas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spine / Side edge */}
              <div
                className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-[#f3f4f6] to-white border-y border-l border-[#d1d5db] rounded-l-lg"
                style={{ transform: "rotateY(82deg) translateX(-1.5px)", transformOrigin: "left center" }}
              />

              {/* Reflection */}
              <div
                className="absolute left-0 right-0 h-[200px] bg-gradient-to-b from-[#0f172a]/5 to-transparent blur-sm"
                style={{ top: "100%", transform: "scaleY(-0.4) rotateY(-8deg)", opacity: 0.3 }}
              />
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [-8, 8, -8], x: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-6 -right-8 px-3 py-2 bg-white border border-[#e2e8f0] rounded-md shadow-lg flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-[#ea580c] rounded-full" />
              <span className="text-xs font-medium text-foreground font-mono">AO VIVO</span>
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6], x: [3, -3, 3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-10 px-3 py-2 bg-white border border-[#e2e8f0] rounded-md shadow-lg flex items-center gap-2"
            >
              <Zap size={12} className="text-[#0f172a]" />
              <span className="text-xs font-medium text-foreground">R$ 149</span>
            </motion.div>

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 -right-14 px-3 py-2 bg-white border border-[#e2e8f0] rounded-md shadow-lg"
            >
              <span className="text-xs text-muted-foreground font-mono">34/50</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fa] to-transparent" />
    </section>
  );
}
