import { notFound } from "next/navigation";
import { BadgeCheck, Calendar, Clock, Timer, Users } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { BackLink } from "@/components/BackLink";
import { TeacherAvatar } from "@/components/TeacherAvatar";
import { BuyButton } from "./BuyButton";
import {
  getClassEventById,
  getEnrollmentForStudent,
  getInstitutionById,
  getStudentAccessState,
  getSubjectById,
  getTeacherById,
  getUserById,
  isClassSoldOut,
  viewer,
} from "@/lib/domain";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ClassEventPage({ params, searchParams }: PageProps) {
  const { classEventId } = await params;
  const { from } = await searchParams;
  const fromAgenda = from === "agenda";
  const classEvent = getClassEventById(classEventId);

  if (!classEvent || classEvent.publicationStatus !== "PUBLISHED") {
    notFound();
  }

  const institution = getInstitutionById(classEvent.institutionId);
  const subject = getSubjectById(classEvent.subjectId);
  const teacher = getTeacherById(classEvent.teacherProfileId);
  const teacherUser = teacher ? getUserById(teacher.userId) : undefined;
  const enrollment = getEnrollmentForStudent(classEvent.id, viewer.studentProfileId);
  const accessState = getStudentAccessState({ classEvent, enrollment });
  const soldOut = isClassSoldOut(classEvent);
  const spotsLeft = classEvent.capacity - classEvent.soldSeats;

  return (
    <div className="space-y-10">
      {/* Breadcrumb + pills */}
      <div className="space-y-4">
        <BackLink
          href={fromAgenda ? "/aluno/meus-auloes" : `/instituicoes/${classEvent.institutionId}/materias/${classEvent.subjectId}`}
          label={fromAgenda ? "Minha Agenda" : (subject?.name ?? "Matéria")}
        />

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="default">{institution?.shortName}</StatusPill>
          <StatusPill tone="muted">{subject?.name}</StatusPill>
          {soldOut ? (
            <StatusPill tone="warn">Esgotado</StatusPill>
          ) : (
            <StatusPill tone="success">
              {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""}
            </StatusPill>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr,340px] lg:items-start">

        {/* ── Left: content ─────────────────────────── */}
        <div className="space-y-8">

          {/* Title + description */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {classEvent.title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {classEvent.description}
            </p>
          </div>

          {/* Teacher card */}
          {teacher && (
            <div className="flex items-start gap-5 rounded-sm border border-border bg-surface p-5">
              <TeacherAvatar
                initials={teacher.photo}
                photoUrl={teacher.photoUrl}
                alt={teacherUser?.name ?? teacher.headline}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
              />
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                  Professor
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-xl text-foreground">
                    {teacherUser?.name ?? teacher.headline}
                  </p>
                  {teacher.isVerified && (
                    <BadgeCheck size={16} className="shrink-0 text-brand-accent" />
                  )}
                </div>
                <p className="mt-0.5 text-xs font-medium text-brand-accent/80">
                  {teacher.headline}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {teacher.bio}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: purchase sidebar ────────────────── */}
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
              Investimento
            </p>
            <p className="font-display text-4xl text-foreground">
              {formatPrice(classEvent.priceCents)}
            </p>
            {!soldOut && accessState === "NEEDS_PURCHASE" && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Users size={11} />
                {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""} restante{spotsLeft !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* CTA block — varies by access state */}
          {accessState === "NEEDS_PURCHASE" && !soldOut && (
            <BuyButton
              classEventId={classEvent.id}
              price={formatPrice(classEvent.priceCents)}
            />
          )}

          {accessState === "NEEDS_PURCHASE" && soldOut && (
            <div className="w-full rounded-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-amber-400">
              Esgotado
            </div>
          )}

          {accessState === "PENDING_PAYMENT" && (
            <div className="space-y-2">
              <div className="w-full rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-amber-400">
                Pagamento em análise
              </div>
              <p className="text-center text-xs text-muted-foreground">
                O acesso será liberado após confirmação do pagamento.
              </p>
            </div>
          )}

          {accessState === "WAITING_RELEASE" && (
            <div className="space-y-2">
              <div className="w-full rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-400">
                Vaga garantida
              </div>
              <p className="text-center text-xs text-muted-foreground">
                O link de entrada será liberado no horário da aula.
              </p>
            </div>
          )}

          {accessState === "CAN_ENTER" && classEvent.meetingUrl && (
            <a
              href={classEvent.meetingUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex w-full items-center justify-center gap-2.5 rounded-sm bg-brand-accent px-4 py-4 text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.55)]"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
              </span>
              Entrar na aula
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
