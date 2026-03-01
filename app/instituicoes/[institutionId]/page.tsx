"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { useInstitution, useInstitutionSubjects } from "@/lib/queries/institutions";
import { SubjectIcon } from "@/components/SubjectIcon";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ institutionId: string }>;
};

const SUBJECT_COLORS: Record<string, string> = {
  "sub-matematica": "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-400/60",
  "sub-calculo":    "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-400/60",
  "sub-fisica":     "from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-400/60",
  "sub-quimica":    "from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-400/60",
  "sub-biologia":   "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-400/60",
  "sub-historia":   "from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-400/60",
  "sub-geografia":  "from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-400/60",
  "sub-portugues":  "from-rose-500/20 to-rose-500/5 border-rose-500/30 hover:border-rose-400/60",
  "sub-literatura": "from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:border-pink-400/60",
  "sub-redacao":    "from-rose-500/20 to-rose-500/5 border-rose-500/30 hover:border-rose-400/60",
  "sub-direito":    "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 hover:border-indigo-400/60",
  "sub-estatistica":"from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-400/60",
  "sub-ingles":     "from-sky-500/20 to-sky-500/5 border-sky-500/30 hover:border-sky-400/60",
};

const SUBJECT_ICON_COLORS: Record<string, string> = {
  "sub-matematica": "text-cyan-400",
  "sub-calculo":    "text-cyan-400",
  "sub-fisica":     "text-blue-400",
  "sub-quimica":    "text-purple-400",
  "sub-biologia":   "text-emerald-700",
  "sub-historia":   "text-amber-700",
  "sub-geografia":  "text-orange-400",
  "sub-portugues":  "text-rose-400",
  "sub-literatura": "text-pink-400",
  "sub-redacao":    "text-rose-400",
  "sub-direito":    "text-indigo-400",
  "sub-estatistica":"text-cyan-400",
  "sub-ingles":     "text-sky-400",
};

export default function InstitutionPage({ params }: PageProps) {
  const { institutionId } = use(params);
  const { data: institution, isLoading: loadingInst } = useInstitution(institutionId);
  const { data: subjects, isLoading: loadingSubjects } = useInstitutionSubjects(institutionId);

  if (loadingInst || loadingSubjects) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-24 bg-[#d1d5db] rounded-md" />
        <div className="space-y-3">
          <div className="h-6 w-32 bg-[#d1d5db] rounded-md" />
          <div className="h-12 w-96 bg-[#d1d5db] rounded-md" />
          <div className="h-4 w-80 bg-[#d1d5db] rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-[#d1d5db] rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!institution) {
    return <div className="p-8 text-muted-foreground">Instituicao nao encontrada.</div>;
  }

  const subjectList = subjects ?? [];

  return (
    <div className="space-y-14">
      {/* Header */}
      <header className="space-y-6">
        <BackLink href="/explorar" label="Instituicoes" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-block rounded-sm border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {institution.type === "SCHOOL" ? "Ensino Medio" : "Graduacao"}
              </span>
              <span className="text-xs text-muted-foreground">{institution.city}</span>
            </div>
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {institution.name}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Escolha a materia para ver os professores disponiveis e agendar sua proxima aula.
            </p>
          </div>
        </div>

        {/* Accent divider */}
        <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
      </header>

      {/* Subjects grid */}
      {subjectList.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhuma materia cadastrada</p>
          <p className="mt-2 text-sm text-muted-foreground">Esta instituicao ainda nao possui materias disponiveis.</p>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-brand-accent" />
              <h2 className="font-display text-2xl text-foreground">
                Materias
              </h2>
            </div>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {subjectList.length} materias
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subjectList.map((subject) => {
              const colorClass = SUBJECT_COLORS[subject.subjectId] ?? "from-gray-200/60 to-gray-200/20 border-gray-300/40 hover:border-gray-400/60";
              const iconColorClass = SUBJECT_ICON_COLORS[subject.subjectId] ?? "text-gray-500";

              return (
                <Link
                  key={subject.subjectId}
                  href={`/instituicoes/${institutionId}/materias/${subject.subjectId}`}
                  className={`group relative flex flex-col gap-3 rounded-md border bg-gradient-to-b p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 ${colorClass}`}
                >
                  <SubjectIcon name={undefined} size={22} className={iconColorClass} />

                  <div className="flex-1">
                    <p className="font-display text-base font-semibold leading-tight text-foreground">
                      {subject.subjectName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {subject.teacherCount > 0 ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Users size={11} />
                        {subject.teacherCount} professor{subject.teacherCount !== 1 ? "es" : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">Em breve</span>
                    )}
                    <ChevronRight
                      size={14}
                      className="text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-muted-foreground"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
