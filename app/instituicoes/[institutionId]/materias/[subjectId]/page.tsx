"use client";

import { use } from "react";
import Link from "next/link";
import { SubjectIcon } from "@/components/SubjectIcon";
import { BackLink } from "@/components/BackLink";
import { useInstitution, useSubjectTeachers } from "@/lib/queries/institutions";
import { useClassEvents } from "@/lib/queries/class-events";
import { TeacherGrid, type TeacherCardData } from "@/components/TeacherGrid";

type PageProps = {
  params: Promise<{ institutionId: string; subjectId: string }>;
};

const AVATAR_PALETTE: Array<{
  cls: string;
  hex: string;
}> = [
  { cls: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",    hex: "#22d3ee" },
  { cls: "bg-purple-500/20 text-purple-300 border-purple-500/30", hex: "#a78bfa" },
  { cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", hex: "#34d399" },
  { cls: "bg-amber-500/20 text-amber-300 border-amber-500/30",  hex: "#fbbf24" },
  { cls: "bg-rose-500/20 text-rose-300 border-rose-500/30",    hex: "#fb7185" },
];

export default function SubjectPage({ params }: PageProps) {
  const { institutionId, subjectId } = use(params);
  const { data: institution, isLoading: loadingInst } = useInstitution(institutionId);
  const { data: teachers, isLoading: loadingTeachers } = useSubjectTeachers(institutionId, subjectId);
  const { data: allEvents, isLoading: loadingEvents } = useClassEvents({ institutionId, subjectId });

  const isLoading = loadingInst || loadingTeachers || loadingEvents;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="space-y-3">
          <div className="h-6 w-32 bg-[#d1d5db] rounded" />
          <div className="h-12 w-80 bg-[#d1d5db] rounded" />
          <div className="h-4 w-60 bg-[#d1d5db] rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-[#d1d5db] rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!institution) {
    return <div className="p-8 text-muted-foreground">Instituicao nao encontrada.</div>;
  }

  const teacherList = teachers ?? [];
  const eventList = allEvents ?? [];

  // Derive the subject name from the first teacher's context or from events
  const subjectName = teacherList.length > 0
    ? (eventList.find(e => e.subject)?.subject.name ?? subjectId)
    : subjectId;

  // Build serializable card data for the client component
  const teacherCards: TeacherCardData[] = teacherList.map((teacher, index) => {
    const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
    const teacherEvents = eventList.filter((e) => e.teacherProfile.id === teacher.teacherProfile.id);
    const openCount = teacherEvents.filter((e) => e.soldSeats < e.capacity).length;

    const nextEvent = teacher.nextEvent
      ? eventList.find(e => e.id === teacher.nextEvent?.id)
      : undefined;

    return {
      id: teacher.teacherProfile.id,
      photo: teacher.teacherProfile.photoUrl ? "" : (teacher.user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()),
      photoUrl: teacher.teacherProfile.photoUrl ?? undefined,
      headline: teacher.teacherProfile.headline,
      bio: teacher.teacherProfile.bio,
      isVerified: false,
      userName: teacher.user.name,
      avatarColor: palette.cls,
      avatarTextColor: "",
      accentHex: palette.hex,
      nextEvent: nextEvent as TeacherCardData["nextEvent"],
      events: teacherEvents as TeacherCardData["events"],
      openCount,
    };
  });

  return (
    <div className="space-y-12">
      {/* Breadcrumb + Header */}
      <header className="space-y-5">
        <BackLink href={`/instituicoes/${institutionId}`} label={institution.shortName} />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-sm border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {institution.type === "SCHOOL" ? "Ensino Medio" : "Graduacao"}
            </span>
            <span className="text-xs text-muted-foreground">{institution.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <SubjectIcon name={undefined} size={36} className="text-brand-accent" />
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {subjectName}
            </h1>
          </div>

          <p className="text-base text-muted-foreground">
            {teacherList.length > 0
              ? `${teacherList.length} professor${teacherList.length !== 1 ? "es" : ""} disponive${teacherList.length !== 1 ? "is" : "l"} · ${eventList.length} aula${eventList.length !== 1 ? "s" : ""} publicada${eventList.length !== 1 ? "s" : ""}`
              : "Nenhum professor disponivel no momento."}
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
      </header>

      {/* Teacher grid */}
      {teacherList.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhum professor cadastrado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda nao ha professores com aulas publicadas para esta materia.
          </p>
          <Link
            href={`/instituicoes/${institutionId}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:opacity-70"
          >
            Ver outras materias
          </Link>
        </div>
      ) : (
        <TeacherGrid
          teachers={teacherCards}
          institutionId={institutionId}
        />
      )}
    </div>
  );
}
