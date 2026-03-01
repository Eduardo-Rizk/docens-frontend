"use client";

import { use } from "react";
import Link from "next/link";
import { BadgeCheck, Calendar, Clock, Timer, Users, ArrowUpRight } from "lucide-react";
import { SubjectIcon } from "@/components/SubjectIcon";
import { BackLink } from "@/components/BackLink";
import { TeacherAvatar } from "@/components/TeacherAvatar";
import { useInstitution } from "@/lib/queries/institutions";
import { useTeacherDetail } from "@/lib/queries/teachers";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ institutionId: string; teacherProfileId: string }>;
};

const AVATAR_PALETTE = [
  { cls: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", hex: "#22d3ee" },
  { cls: "bg-purple-500/20 text-purple-300 border-purple-500/30", hex: "#a78bfa" },
  { cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", hex: "#34d399" },
  { cls: "bg-amber-500/20 text-amber-300 border-amber-500/30", hex: "#fbbf24" },
  { cls: "bg-rose-500/20 text-rose-300 border-rose-500/30", hex: "#fb7185" },
];

function hashIndex(id: string, len: number) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % len;
}

export default function TeacherProfilePage({ params }: PageProps) {
  const { institutionId, teacherProfileId } = use(params);
  const { data: institution, isLoading: loadingInst } = useInstitution(institutionId);
  const { data: detail, isLoading: loadingDetail } = useTeacherDetail(institutionId, teacherProfileId);

  if (loadingInst || loadingDetail) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="flex gap-6">
          <div className="h-20 w-20 bg-[#d1d5db] rounded-sm" />
          <div className="space-y-3 flex-1">
            <div className="h-10 w-64 bg-[#d1d5db] rounded" />
            <div className="h-4 w-48 bg-[#d1d5db] rounded" />
            <div className="h-4 w-80 bg-[#d1d5db] rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[#d1d5db] rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!institution || !detail) {
    return <div className="p-8 text-muted-foreground">Professor nao encontrado.</div>;
  }

  const teacher = detail.teacherProfile;
  const teacherName = teacher.user.name;
  const palette = AVATAR_PALETTE[hashIndex(teacher.id, AVATAR_PALETTE.length)];
  const initials = teacherName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const profileSubjects = detail.subjects.map(s => s.name);

  // Flatten all class events from classesBySubject
  const allClasses = Object.values(detail.classesBySubject).flatMap(s => s.classEvents);
  const totalOpen = allClasses.filter(e => e.soldSeats < e.capacity).length;

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <BackLink href={`/instituicoes/${institutionId}`} label={institution.shortName} />

      {/* Teacher header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <TeacherAvatar
          initials={initials}
          photoUrl={teacher.photoUrl ?? undefined}
          alt={teacherName}
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border text-xl font-bold ${palette.cls}`}
        />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {teacherName}
            </h1>
          </div>

          <p className="text-base font-medium" style={{ color: palette.hex }}>
            {teacher.headline}
          </p>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {teacher.bio}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {profileSubjects.map((subjectName) => (
              <span
                key={subjectName}
                className="border border-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70"
              >
                {subjectName}
              </span>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {allClasses.length} aula{allClasses.length !== 1 ? "s" : ""} publicada{allClasses.length !== 1 ? "s" : ""}
            {" . "}
            {Object.keys(detail.classesBySubject).length} materia{Object.keys(detail.classesBySubject).length !== 1 ? "s" : ""}
            {totalOpen > 0 && (
              <span className="ml-2 text-emerald-700">. {totalOpen} com vaga</span>
            )}
          </p>
        </div>
      </header>

      <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />

      {/* Classes grouped by subject */}
      {allClasses.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-10 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma aula publicada no momento.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(detail.classesBySubject).map(([, group]) => {
            const subject = group.subject;
            const events = group.classEvents;

            return (
              <section key={subject.id} className="space-y-4">
                {/* Subject header */}
                <div className="flex items-center gap-3">
                  <SubjectIcon
                    name={undefined}
                    size={18}
                    className="text-brand-accent shrink-0"
                  />
                  <h2 className="font-display text-xl text-foreground">
                    {subject.name}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {events.length} aula{events.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Class cards */}
                <div className="flex flex-col gap-3">
                  {events.map((event) => {
                    const sold = event.soldSeats >= event.capacity;
                    const spotsLeft = event.capacity - event.soldSeats;

                    return (
                      <div
                        key={event.id}
                        className="flex flex-col gap-5 rounded-md border border-border bg-surface p-6 transition-colors duration-200 hover:border-[#9ca3af] hover:shadow-md sm:flex-row sm:items-center sm:gap-8"
                      >
                        {/* Info */}
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="font-display text-lg leading-snug text-foreground">
                            {event.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-brand-accent" />
                              {formatLongDate(event.startsAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={11} className="text-brand-accent" />
                              {formatTime(event.startsAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Timer size={11} />
                              {event.durationMin} min
                            </span>
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-3">
                          <div className="text-right">
                            <p className="font-display text-2xl text-foreground">
                              {formatPrice(event.priceCents)}
                            </p>
                            {sold ? (
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                Esgotado
                              </p>
                            ) : (
                              <p className="flex items-center justify-end gap-1 text-[10px] font-medium text-emerald-700">
                                <Users size={10} />
                                {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>

                          <Link
                            href={`/auloes/${event.id}`}
                            className={`flex items-center gap-2 rounded-sm border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                              sold
                                ? "pointer-events-none cursor-not-allowed border-border text-muted-foreground/40"
                                : "border-brand-accent/30 bg-brand-accent/5 text-brand-accent hover:bg-brand-accent/15"
                            }`}
                          >
                            {sold ? "Esgotado" : "Ver aula"}
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
