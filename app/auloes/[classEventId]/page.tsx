"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Timer, Users, CheckCircle, Lock, AlertCircle, ExternalLink, LogIn } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { BackLink } from "@/components/BackLink";
import { TeacherAvatar } from "@/components/TeacherAvatar";
import { useClassEvent } from "@/lib/queries/class-events";
import { useMyClassEventAccess } from "@/lib/queries/student";
import { useAuth } from "@/lib/auth-context";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";
import { getEventTemporalState, isPurchaseBlocked } from "@/lib/temporal";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

export default function ClassEventPage({ params }: PageProps) {
  const { classEventId } = use(params);
  const searchParams = useSearchParams();
  const fromAgenda = searchParams.get("from") === "agenda";
  const { data: detail, isLoading } = useClassEvent(classEventId);
  const { user } = useAuth();
  const { accessState, meetingUrl } = useMyClassEventAccess(
    classEventId,
    user?.role === "STUDENT",
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-[#d1d5db] rounded" />
          <div className="h-6 w-20 bg-[#d1d5db] rounded" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div className="space-y-4">
            <div className="h-12 w-96 bg-[#d1d5db] rounded" />
            <div className="h-24 w-full bg-[#d1d5db] rounded" />
            <div className="h-32 w-full bg-[#d1d5db] rounded" />
          </div>
          <div className="h-80 bg-[#d1d5db] rounded" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return <div className="p-8 text-muted-foreground">Aula nao encontrada.</div>;
  }

  const classEvent = detail.classEvent;
  const institution = detail.institution;
  const subject = detail.subject;
  const teacher = detail.teacher;

  const temporalState = getEventTemporalState(classEvent.startsAt, classEvent.durationMin, classEvent.publicationStatus);
  const purchaseBlocked = isPurchaseBlocked(classEvent.startsAt, classEvent.durationMin, classEvent.publicationStatus);

  const soldOut = classEvent.isSoldOut;
  const spotsLeft = classEvent.spotsLeft;
  const teacherName = teacher.userName;
  const teacherInitials = teacher.photo || teacherName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-10">
      {/* Breadcrumb + pills */}
      <div className="space-y-4">
        <BackLink
          href={fromAgenda ? "/aluno/meus-auloes" : `/instituicoes/${institution.id}/materias/${subject.id}`}
          label={fromAgenda ? "Minha Agenda" : subject.name}
        />

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="default">{institution.shortName}</StatusPill>
          <StatusPill tone="muted">{subject.name}</StatusPill>
          {temporalState === "live" && (
            <StatusPill tone="danger">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              Ao vivo
            </StatusPill>
          )}
          {temporalState === "past" && (
            <StatusPill tone="muted">Encerrada</StatusPill>
          )}
          {temporalState === "upcoming" && (
            soldOut ? (
              <StatusPill tone="warn">Esgotado</StatusPill>
            ) : (
              <StatusPill tone="success">
                {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""}
              </StatusPill>
            )
          )}
        </div>
      </div>

      {/* Main grid */}
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

          {/* Teacher card */}
          <div className="flex items-start gap-5 rounded-sm border border-border bg-surface p-5">
            <TeacherAvatar
              initials={teacherInitials}
              photoUrl={undefined}
              alt={teacherName}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
            />
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                Professor
              </p>
              <p className="font-display text-xl text-foreground">
                {teacherName}
              </p>
            </div>
          </div>
        </div>

        {/* Right: sidebar — changes based on student enrollment state */}
        {accessState === "CAN_ENTER" ? (
          <aside className="rounded-sm border border-emerald-500/30 bg-surface p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {temporalState === "live" && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <p className="text-sm font-bold text-emerald-400">
                  {temporalState === "live" ? "Ao vivo agora" : "Vaga garantida"}
                </p>
              </div>
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

            {meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-emerald-700"
              >
                <ExternalLink size={16} />
                Entrar na aula
              </a>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock size={14} className="shrink-0" />
                  O link será liberado no horário da aula
                </div>
              </div>
            )}

            <Link
              href="/aluno/meus-auloes"
              className="flex w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Voltar para minha agenda
            </Link>
          </aside>
        ) : accessState === "WAITING_RELEASE" ? (
          <aside className="rounded-sm border border-emerald-500/20 bg-surface p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <p className="text-sm font-bold text-emerald-400">Vaga garantida</p>
              </div>
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

            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Lock size={14} className="shrink-0" />
              O link de acesso será liberado no horário da aula
            </div>

            <Link
              href="/aluno/meus-auloes"
              className="flex w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Voltar para minha agenda
            </Link>
          </aside>
        ) : accessState === "PENDING_PAYMENT" ? (
          <aside className="rounded-sm border border-amber-500/20 bg-surface p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" />
                <p className="text-sm font-bold text-amber-400">Pagamento pendente</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <Calendar size={14} className="shrink-0 text-brand-accent" />
                  {formatLongDate(classEvent.startsAt)}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <Clock size={14} className="shrink-0 text-brand-accent" />
                  {formatTime(classEvent.startsAt)}
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <Link
              href={`/checkout/${classEvent.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-amber-700"
            >
              Completar pagamento
            </Link>
          </aside>
        ) : (
          /* Default: NEEDS_PURCHASE or not logged in */
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
            <div className={`space-y-1.5 ${purchaseBlocked ? "opacity-50" : ""}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                Investimento
              </p>
              <p className="font-display text-4xl text-foreground">
                {formatPrice(classEvent.priceCents)}
              </p>
              {!soldOut && !purchaseBlocked && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <Users size={11} />
                  {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""} restante{spotsLeft !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* CTA */}
            {purchaseBlocked ? (
              <div className="w-full rounded-sm border border-border bg-surface px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Aula encerrada
              </div>
            ) : soldOut ? (
              <div className="w-full rounded-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-amber-700">
                Esgotado
              </div>
            ) : user ? (
              <Link
                href={`/checkout/${classEvent.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ea580c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:bg-[#c2410c]"
              >
                Garanta sua vaga · {formatPrice(classEvent.priceCents)}
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/login?redirect=/auloes/${classEvent.id}`}
                  className="flex w-full items-center justify-center gap-2.5 rounded-md bg-[#ea580c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#c2410c]"
                >
                  <LogIn size={16} />
                  Faça login para garantir sua vaga
                </Link>
                <p className="text-center text-[11px] text-muted-foreground/70">
                  Você precisa estar logado para comprar esta aula
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
