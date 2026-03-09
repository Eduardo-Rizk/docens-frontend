"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { useCourseSemesters } from "@/lib/queries/institutions";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ institutionId: string; courseId: string }>;
};

export default function CourseSemestersPage({ params }: PageProps) {
  const { institutionId, courseId } = use(params);
  const { data, isLoading } = useCourseSemesters(institutionId, courseId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-24 bg-[#d1d5db] rounded-md" />
        <div className="space-y-3">
          <div className="h-6 w-32 bg-[#d1d5db] rounded-md" />
          <div className="h-12 w-80 bg-[#d1d5db] rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-[#d1d5db] rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-muted-foreground">Curso nao encontrado.</div>;
  }

  const { institution, course, semesters } = data;

  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <BackLink href={`/instituicoes/${institutionId}`} label={institution.shortName} />

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-sm border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Graduacao
            </span>
            <span className="text-xs text-muted-foreground">{institution.name}</span>
          </div>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {course.name}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Escolha o semestre para ver as materias disponiveis.
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
      </header>

      {semesters.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhum semestre cadastrado</p>
          <p className="mt-2 text-sm text-muted-foreground">Este curso ainda nao possui semestres disponiveis.</p>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-brand-accent" />
              <h2 className="font-display text-2xl text-foreground">Semestres</h2>
            </div>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {semesters.length} semestres
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {semesters.map((semester) => (
              <Link
                key={semester.yearOrder}
                href={`/instituicoes/${institutionId}/cursos/${courseId}/semestres/${semester.yearOrder}`}
                className="group relative flex flex-col gap-3 rounded-md border border-border bg-gradient-to-b from-purple-500/10 to-purple-500/0 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/40 hover:shadow-lg hover:shadow-black/10"
              >
                <BookOpen size={22} className="text-purple-400" />

                <div className="flex-1">
                  <p className="font-display text-base font-semibold leading-tight text-foreground">
                    {semester.yearLabel}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {semester.subjectCount} materia{semester.subjectCount !== 1 ? "s" : ""}
                  </span>
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
