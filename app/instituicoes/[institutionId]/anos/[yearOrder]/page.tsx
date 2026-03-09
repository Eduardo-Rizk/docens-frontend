"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { useYearSubjects } from "@/lib/queries/institutions";
import { SubjectIcon } from "@/components/SubjectIcon";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ institutionId: string; yearOrder: string }>;
};

export default function YearSubjectsPage({ params }: PageProps) {
  const { institutionId, yearOrder: yearOrderStr } = use(params);
  const yearOrder = parseInt(yearOrderStr, 10);
  const { data, isLoading } = useYearSubjects(institutionId, yearOrder);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded-md" />
        <div className="space-y-3">
          <div className="h-6 w-32 bg-[#d1d5db] rounded-md" />
          <div className="h-12 w-80 bg-[#d1d5db] rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#d1d5db] rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-muted-foreground">Ano nao encontrado.</div>;
  }

  const { institution, yearLabel, subjects } = data;

  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <BackLink href={`/instituicoes/${institutionId}`} label={institution.shortName} />

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-sm border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Ensino Medio
            </span>
            <span className="text-xs text-muted-foreground">{institution.name}</span>
          </div>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {yearLabel}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Escolha a materia para ver os professores disponiveis.
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
      </header>

      {subjects.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhuma materia cadastrada</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Este ano ainda nao possui materias disponiveis.
          </p>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-brand-accent" />
              <h2 className="font-display text-2xl text-foreground">Materias</h2>
            </div>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {subjects.length} materia{subjects.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map((subject) => (
              <Link
                key={subject.subjectId}
                href={`/instituicoes/${institutionId}/materias/${subject.subjectId}`}
                className="group relative flex flex-col gap-3 rounded-md border border-border bg-gradient-to-b from-cyan-500/10 to-cyan-500/0 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-black/10"
              >
                <SubjectIcon name={subject.subjectIcon ?? undefined} size={22} className="text-cyan-400" />

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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
