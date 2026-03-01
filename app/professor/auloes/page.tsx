"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { useTeacherClassEvents } from "@/lib/queries/teacher";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

const publicationConfig: Record<string, { label: string; tone: "muted" | "default" | "success" }> = {
  DRAFT: { label: "Rascunho", tone: "muted" },
  PUBLISHED: { label: "Publicado", tone: "default" },
  FINISHED: { label: "Finalizado", tone: "success" },
};

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
        {label}
      </p>
      <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground/60">
        {count}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ClassEventRow({ classEvent, showBuyers = true }: { classEvent: any; showBuyers?: boolean }) {
  const pub = publicationConfig[classEvent.publicationStatus] ?? publicationConfig.DRAFT;

  return (
    <article
      className="group relative flex flex-col gap-4 rounded-md border border-border bg-surface p-5 transition-all hover:border-[#9ca3af] hover:shadow-md sm:flex-row sm:items-center sm:gap-6"
    >
      {/* Date/time */}
      <div className="w-28 shrink-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
          {formatLongDate(classEvent.startsAt).split(",")[0]}
        </p>
        <p className="font-display text-2xl leading-none text-foreground">
          {formatTime(classEvent.startsAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatLongDate(classEvent.startsAt).split(",").slice(1).join(",").trim()}
        </p>
      </div>

      <div className="hidden h-12 w-px bg-border sm:block" />

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-display text-lg leading-snug text-foreground">
          {classEvent.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {classEvent.institution?.shortName ?? ""} . {classEvent.subject?.name ?? ""}
          <span className="ml-2 text-muted-foreground/50">
            . {classEvent.durationMin} min
          </span>
        </p>
      </div>

      {/* Meta + links */}
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        {classEvent.soldSeats !== undefined && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users size={11} />
            {classEvent.soldSeats}/{classEvent.capacity}
          </span>
        )}
        <span className="text-xs font-semibold text-foreground">
          {formatPrice(classEvent.priceCents)}
        </span>
        <StatusPill tone={pub.tone}>{pub.label}</StatusPill>
        {showBuyers && (
          <Link
            href={`/professor/auloes/${classEvent.id}/compradores`}
            className="text-[10px] font-bold uppercase tracking-wider text-brand-accent hover:opacity-70 transition-opacity"
          >
            Compradores
          </Link>
        )}
        <Link
          href={`/auloes/${classEvent.id}`}
          className="text-muted-foreground/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-brand-accent"
        >
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default function TeacherAuloesPage() {
  const { data, isLoading } = useTeacherClassEvents();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="space-y-3">
          <div className="h-10 w-48 bg-[#d1d5db] rounded" />
          <div className="h-4 w-64 bg-[#d1d5db] rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-[#d1d5db] rounded-sm" />
        ))}
      </div>
    );
  }

  const published = (data?.published ?? []) as Array<Record<string, unknown>>;
  const drafts = (data?.drafts ?? []) as Array<Record<string, unknown>>;
  const finished = (data?.finished ?? []) as Array<Record<string, unknown>>;
  const totalClasses = published.length + drafts.length + finished.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Meus Auloes
          </h1>
          <p className="text-base text-muted-foreground">
            {published.length} publicado{published.length !== 1 ? "s" : ""}
            {drafts.length > 0 && (
              <span className="ml-2 text-muted-foreground/50">
                . {drafts.length} rascunho{drafts.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/professor/dashboard"
          className="shrink-0 text-xs font-semibold text-brand-accent hover:opacity-70 transition-opacity"
        >
          Ver dashboard →
        </Link>
      </header>

      {totalClasses === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhum aulao ainda</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie seu primeiro aulao para comecar a receber alunos.
          </p>
          <Link
            href="/professor/novo-aulao"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#ea580c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#c2410c] transition-all"
          >
            Criar aulao
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {published.length > 0 && (
            <section className="space-y-3">
              <SectionHeader label="Publicados" count={published.length} />
              <div className="flex flex-col gap-2">
                {published.map((classEvent) => (
                  <ClassEventRow key={classEvent.id as string} classEvent={classEvent} />
                ))}
              </div>
            </section>
          )}

          {drafts.length > 0 && (
            <section className="space-y-3">
              <SectionHeader label="Rascunhos" count={drafts.length} />
              <div className="flex flex-col gap-2">
                {drafts.map((classEvent) => (
                  <ClassEventRow key={classEvent.id as string} classEvent={classEvent} showBuyers={false} />
                ))}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section className="space-y-3">
              <SectionHeader label="Finalizados" count={finished.length} />
              <div className="flex flex-col gap-2">
                {finished.map((classEvent) => (
                  <ClassEventRow key={classEvent.id as string} classEvent={classEvent} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
