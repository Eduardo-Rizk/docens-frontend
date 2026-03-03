"use client";

import { use } from "react";
import Link from "next/link";
import { Calendar, Clock, Timer, Users, ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { BackLink } from "@/components/BackLink";
import { useTeacherClassEvent, useUpdateClassEvent } from "@/lib/queries/teacher";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

const publicationConfig: Record<string, { label: string; tone: "muted" | "default" | "success" | "warn" }> = {
  DRAFT: { label: "Rascunho", tone: "muted" },
  PUBLISHED: { label: "Publicado", tone: "default" },
  FINISHED: { label: "Finalizado", tone: "success" },
};

export default function TeacherClassEventDetailPage({ params }: PageProps) {
  const { classEventId } = use(params);
  const { data: detail, isLoading } = useTeacherClassEvent(classEventId);
  const updateClassEvent = useUpdateClassEvent();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="h-12 w-96 bg-[#d1d5db] rounded" />
        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div className="space-y-4">
            <div className="h-24 w-full bg-[#d1d5db] rounded" />
            <div className="h-32 w-full bg-[#d1d5db] rounded" />
          </div>
          <div className="h-80 bg-[#d1d5db] rounded" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return <div className="p-8 text-muted-foreground">Aulão não encontrado.</div>;
  }

  const { classEvent, institution, subject } = detail;
  const pub = publicationConfig[classEvent.publicationStatus] ?? publicationConfig.DRAFT;
  const isDraft = classEvent.publicationStatus === "DRAFT";
  const isPublished = classEvent.publicationStatus === "PUBLISHED";

  function handleAction(action: string) {
    updateClassEvent.mutate({ id: classEvent.id, action });
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <BackLink href="/professor/auloes" label="Meus Aulões" />

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={pub.tone}>{pub.label}</StatusPill>
          <StatusPill tone="default">{institution.shortName}</StatusPill>
          <StatusPill tone="muted">{subject.name}</StatusPill>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,340px] lg:items-start">
        {/* Left: content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {classEvent.title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {classEvent.description}
            </p>
          </div>

          {/* Meeting URL */}
          {classEvent.meetingUrl && (
            <div className="rounded-sm border border-border bg-surface p-5 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                Link do encontro
              </p>
              <a
                href={classEvent.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-cta hover:opacity-70 transition-opacity"
              >
                {classEvent.meetingUrl}
                <ExternalLink size={12} />
              </a>
              <p className="text-[10px] text-muted-foreground/50">
                Status: {classEvent.meetingStatus === "RELEASED" ? "Liberado para alunos" : "Bloqueado"}
              </p>
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <aside className="rounded-sm border border-border bg-surface p-6 space-y-6">
          {/* Date + time */}
          <div className="space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Data do encontro
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <Calendar size={14} className="shrink-0 text-brand-accent" />
                {formatLongDate(classEvent.startsAt)}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <Clock size={14} className="shrink-0 text-brand-accent" />
                {formatTime(classEvent.startsAt)}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Timer size={14} className="shrink-0" />
                {classEvent.durationMin} min de duração
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Price + spots */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Preço
            </p>
            <p className="font-display text-4xl text-foreground">
              {formatPrice(classEvent.priceCents)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users size={11} />
              {classEvent.soldSeats}/{classEvent.capacity ?? "∞"} vagas
              {classEvent.spotsLeft !== null && (
                <span className="text-muted-foreground/50">
                  ({classEvent.spotsLeft} restante{classEvent.spotsLeft !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Actions */}
          <div className="space-y-2">
            {isDraft && (
              <button
                onClick={() => handleAction("publish")}
                disabled={updateClassEvent.isPending}
                className="w-full rounded-md bg-[#ea580c] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:bg-[#c2410c] disabled:opacity-50"
              >
                {updateClassEvent.isPending ? "Publicando..." : "Publicar aulão"}
              </button>
            )}
            {isPublished && (
              <>
                <Link
                  href={`/professor/auloes/${classEvent.id}/compradores`}
                  className="flex w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-3 text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:border-[#9ca3af]"
                >
                  Ver compradores
                </Link>
                <button
                  onClick={() => handleAction("unpublish")}
                  disabled={updateClassEvent.isPending}
                  className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all hover:border-[#9ca3af] hover:text-foreground disabled:opacity-50"
                >
                  Despublicar
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
