"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Calendar, Clock, ArrowUpRight, Users } from "lucide-react";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";
import { TeacherAvatar } from "@/components/TeacherAvatar";

type ClassEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  durationMin: number;
  priceCents: number;
  capacity: number;
  soldSeats: number;
  publicationStatus: string;
};

export type TeacherCardData = {
  id: string;
  photo: string;
  photoUrl?: string;
  headline: string;
  bio: string;
  isVerified: boolean;
  userName: string;
  avatarColor: string;
  avatarTextColor: string;
  accentHex: string;
  nextEvent: ClassEvent | undefined;
  events: ClassEvent[];
  openCount: number;
};

function isSoldOut(event: ClassEvent) {
  return event.soldSeats >= event.capacity;
}

// --- Filter Bar ---

function FilterBar({
  teachers,
  selected,
  onSelect,
}: {
  teachers: TeacherCardData[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (teachers.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
        Filtrar por
      </span>

      <button
        onClick={() => onSelect(null)}
        className={`relative rounded-md border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
          selected === null
            ? "border-[#0f172a] bg-[#0f172a]/10 text-[#0f172a]"
            : "border-border text-muted-foreground hover:border-[#9ca3af] hover:text-foreground"
        }`}
      >
        Todos
      </button>

      {teachers.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(selected === t.id ? null : t.id)}
          className={`relative rounded-md border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
            selected === t.id
              ? "border-[#0f172a] bg-[#0f172a]/10 text-[#0f172a]"
              : "border-border text-muted-foreground hover:border-[#9ca3af] hover:text-foreground"
          }`}
        >
          {t.userName}
        </button>
      ))}
    </div>
  );
}

// --- Teacher Card ---

function TeacherCard({
  teacher,
  institutionId,
}: {
  teacher: TeacherCardData;
  institutionId: string;
}) {
  const next = teacher.nextEvent;
  const profileHref = `/instituicoes/${institutionId}/professores/${teacher.id}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-[#d1d5db] bg-white transition-all duration-200 hover:border-[#9ca3af] hover:shadow-md">
      {/* Accent top bar */}
      <div
        className="h-[2px] w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${teacher.accentHex}80, transparent)` }}
      />

      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* -- Teacher identity (links to profile) --- */}
        <Link href={profileHref} className="flex items-start gap-4">
          <TeacherAvatar
            initials={teacher.photo}
            photoUrl={teacher.photoUrl}
            alt={teacher.userName}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${teacher.avatarColor}`}
          />

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-xl leading-tight text-foreground group-hover:text-[#0f172a] transition-colors duration-150">
                {teacher.userName}
              </h3>
              {teacher.isVerified && (
                <BadgeCheck size={16} className="shrink-0 text-[#0f172a]" />
              )}
            </div>

            <p
              className="mt-0.5 text-xs font-medium leading-snug"
              style={{ color: teacher.accentHex }}
            >
              {teacher.headline}
            </p>

            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {teacher.events.length} aula{teacher.events.length !== 1 ? "s" : ""} publicada
              {teacher.events.length !== 1 ? "s" : ""}
              {teacher.openCount > 0 && (
                <span className="ml-1.5 text-emerald-700">
                  &middot; {teacher.openCount} com vaga
                </span>
              )}
            </p>
          </div>
        </Link>

        {/* -- Bio --- */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {teacher.bio}
        </p>

        {/* -- Next class preview --- */}
        {next ? (
          <div className="space-y-3 rounded-md border border-[#e5e7eb] bg-[#f8f9fa] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Proxima aula
            </p>

            <div className="space-y-1">
              <p className="line-clamp-1 text-sm font-semibold leading-snug text-foreground">
                {next.title}
              </p>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {next.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar size={11} />
                {formatLongDate(next.startsAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={11} />
                {formatTime(next.startsAt)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="font-display text-lg text-foreground">
                {formatPrice(next.priceCents)}
              </span>
              {isSoldOut(next) ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Esgotado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                  <Users size={10} />
                  {next.capacity - next.soldSeats} vaga{next.capacity - next.soldSeats !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-[#e5e7eb] bg-[#f8f9fa] p-3">
            <p className="text-xs text-muted-foreground/50">Sem proximas aulas agendadas</p>
          </div>
        )}

        {/* -- CTA -> teacher profile --- */}
        <div className="mt-auto">
          <Link
            href={profileHref}
            className="flex items-center justify-between rounded-md border border-[#ea580c]/30 bg-[#ea580c]/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#ea580c] transition-colors duration-150 hover:bg-[#ea580c]/15"
          >
            <span>Ver todas as aulas</span>
            <ArrowUpRight size={12} className="ml-2 shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// --- Root Export ---

export function TeacherGrid({
  teachers,
  institutionId,
}: {
  teachers: TeacherCardData[];
  institutionId: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const visible = selected ? teachers.filter((t) => t.id === selected) : teachers;

  return (
    <div className="space-y-6">
      <FilterBar teachers={teachers} selected={selected} onSelect={setSelected} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <TeacherCard
            key={t.id}
            teacher={t}
            institutionId={institutionId}
          />
        ))}
      </div>
    </div>
  );
}
