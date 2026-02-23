import { notFound } from "next/navigation";
import { Calendar, Clock, Timer, ShieldCheck, BadgeCheck } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { StatusPill } from "@/components/status-pill";
import { TeacherAvatar } from "@/components/TeacherAvatar";
import { PayButton } from "./PayButton";
import {
  getClassEventById,
  getEnrollmentForStudent,
  getInstitutionById,
  getSubjectById,
  getTeacherById,
  getUserById,
  isClassSoldOut,
  viewer,
} from "@/lib/domain";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

export default async function CheckoutPage({ params }: PageProps) {
  const { classEventId } = await params;
  const classEvent = getClassEventById(classEventId);

  if (!classEvent || classEvent.publicationStatus !== "PUBLISHED") {
    notFound();
  }

  // Already enrolled → redirect logic handled by showing different state
  const enrollment = getEnrollmentForStudent(classEventId, viewer.studentProfileId);
  const alreadyEnrolled = !!enrollment;
  const soldOut = isClassSoldOut(classEvent);

  if (alreadyEnrolled || soldOut) {
    notFound();
  }

  const institution = getInstitutionById(classEvent.institutionId);
  const subject = getSubjectById(classEvent.subjectId);
  const teacher = getTeacherById(classEvent.teacherProfileId);
  const teacherUser = teacher ? getUserById(teacher.userId) : undefined;
  const teacherName = teacherUser?.name ?? teacher?.headline ?? "";

  const price = formatPrice(classEvent.priceCents);

  return (
    <div className="space-y-10">
      <BackLink
        href={`/auloes/${classEventId}`}
        label="Voltar para a aula"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr,380px] lg:items-start">

        {/* ── Left: order summary ───────────────────── */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">
              Revisão do pedido
            </p>
            <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {classEvent.title}
            </h1>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="default">{institution?.shortName}</StatusPill>
            <StatusPill tone="muted">{subject?.name}</StatusPill>
          </div>

          {/* Class details card */}
          <div className="rounded-sm border border-border bg-surface p-5 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Detalhes do encontro
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

            {/* Teacher */}
            {teacher && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <TeacherAvatar
                    initials={teacher.photo}
                    photoUrl={teacher.photoUrl}
                    alt={teacherName}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-xs font-bold text-cyan-300"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-foreground">{teacherName}</p>
                      {teacher.isVerified && (
                        <BadgeCheck size={13} className="text-brand-accent" />
                      )}
                    </div>
                    <p className="text-xs text-brand-accent/70">{teacher.headline}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {classEvent.description}
          </p>
        </div>

        {/* ── Right: payment panel ──────────────────── */}
        <aside className="rounded-sm border border-border bg-surface p-6 space-y-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Resumo do pagamento
          </p>

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Acesso ao encontro ao vivo</span>
              <span className="text-foreground">{price}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="font-display text-2xl text-foreground">{price}</span>
            </div>
          </div>

          {/* Pay button */}
          <PayButton classEventId={classEventId} />

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
            <ShieldCheck size={12} />
            Pagamento seguro · Stripe · SSL
          </div>

          {/* Spots left */}
          <p className="text-center text-[11px] text-muted-foreground/50">
            {classEvent.capacity - classEvent.soldSeats} vaga{classEvent.capacity - classEvent.soldSeats !== 1 ? "s" : ""} restante{classEvent.capacity - classEvent.soldSeats !== 1 ? "s" : ""}
          </p>
        </aside>
      </div>
    </div>
  );
}
