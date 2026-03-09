"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, GraduationCap, Lock, Users } from "lucide-react";
import { useInstitution, useCourses, useInstitutionSubjects } from "@/lib/queries/institutions";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ institutionId: string }>;
};

export default function InstitutionPage({ params }: PageProps) {
  const { institutionId } = use(params);
  const { data: institution, isLoading: loadingInst } = useInstitution(institutionId);

  if (loadingInst) {
    return <LoadingSkeleton />;
  }

  if (!institution) {
    return <div className="p-8 text-muted-foreground">Instituicao nao encontrada.</div>;
  }

  if (!institution.isEnabled) {
    return <DisabledView institution={institution} />;
  }

  if (institution.type === "UNIVERSITY") {
    return <UniversityView institutionId={institutionId} institution={institution} />;
  }

  return <SchoolView institutionId={institutionId} institution={institution} />;
}

// --- University: shows courses ---

function UniversityView({
  institutionId,
  institution,
}: {
  institutionId: string;
  institution: { name: string; shortName: string; city: string; type: string };
}) {
  const { data, isLoading } = useCourses(institutionId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-14">
      <Header
        institution={institution}
        description="Escolha o curso para explorar semestres e materias."
      />

      {courses.length === 0 ? (
        <EmptyState message="Nenhum curso cadastrado" sub="Esta instituicao ainda nao possui cursos disponiveis." />
      ) : (
        <section className="space-y-6">
          <SectionTitle title="Cursos" count={`${courses.length} cursos`} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/instituicoes/${institutionId}/cursos/${course.id}`}
                className="group relative flex flex-col gap-4 rounded-md border border-border bg-gradient-to-b from-cyan-500/10 to-cyan-500/0 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-black/10"
              >
                <GraduationCap size={24} className="text-cyan-400" />

                <div className="flex-1 space-y-1">
                  <p className="font-display text-lg font-semibold leading-tight text-foreground">
                    {course.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {course.semesterCount} semestres · {course.subjectCount} materias
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-muted-foreground"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// --- School: shows years ---

function SchoolView({
  institutionId,
  institution,
}: {
  institutionId: string;
  institution: { name: string; shortName: string; city: string; type: string };
}) {
  const { data, isLoading } = useInstitutionSubjects(institutionId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const years = data?.years ?? [];

  return (
    <div className="space-y-14">
      <Header
        institution={institution}
        description="Escolha o ano para ver as materias disponiveis."
      />

      {years.length === 0 ? (
        <EmptyState message="Nenhuma materia cadastrada" sub="Esta instituicao ainda nao possui materias disponiveis." />
      ) : (
        <section className="space-y-6">
          <SectionTitle title="Anos" count={`${years.length} anos`} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {years.map((year) => (
              <Link
                key={year.yearOrder}
                href={`/instituicoes/${institutionId}/anos/${year.yearOrder}`}
                className="group relative flex flex-col gap-4 rounded-md border border-border bg-gradient-to-b from-blue-500/10 to-blue-500/0 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 hover:shadow-lg hover:shadow-black/10"
              >
                <BookOpen size={24} className="text-blue-400" />

                <div className="flex-1 space-y-1">
                  <p className="font-display text-lg font-semibold leading-tight text-foreground">
                    {year.yearLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {year.subjects.length} materia{year.subjects.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-muted-foreground"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// --- Disabled institution (Inteli) ---

function DisabledView({
  institution,
}: {
  institution: { name: string; shortName: string; city: string; type: string };
}) {
  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <BackLink href="/explorar" label="Instituicoes" />

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
        </div>

        <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
      </header>

      <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-surface p-16 text-center">
        <Lock size={48} className="text-muted-foreground/40" />
        <p className="font-display text-2xl text-foreground">Em breve</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Esta instituicao estara disponivel em breve. Fique ligado para novidades!
        </p>
        <Link
          href="/explorar"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:opacity-70"
        >
          Explorar outras instituicoes
        </Link>
      </div>
    </div>
  );
}

// --- Shared sub-components ---

function Header({
  institution,
  description,
}: {
  institution: { name: string; shortName: string; city: string; type: string };
  description: string;
}) {
  return (
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
            {description}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
    </header>
  );
}

function SectionTitle({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="h-6 w-1 bg-brand-accent" />
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-medium text-muted-foreground tabular-nums">{count}</span>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-12 text-center">
      <p className="font-display text-2xl text-foreground">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-4">
      <div className="h-4 w-24 bg-[#d1d5db] rounded-md" />
      <div className="space-y-3">
        <div className="h-6 w-32 bg-[#d1d5db] rounded-md" />
        <div className="h-12 w-96 bg-[#d1d5db] rounded-md" />
        <div className="h-4 w-80 bg-[#d1d5db] rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-[#d1d5db] rounded-md" />
        ))}
      </div>
    </div>
  );
}
