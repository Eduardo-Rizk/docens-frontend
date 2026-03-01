"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Timer, ShieldCheck, Lock } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { StatusPill } from "@/components/status-pill";
import { TeacherAvatar } from "@/components/TeacherAvatar";
import { useClassEvent } from "@/lib/queries/class-events";
import { useCreateEnrollment } from "@/lib/queries/enrollments";
import { useConfirmPayment } from "@/lib/queries/payments";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

export default function CheckoutPage({ params }: PageProps) {
  const { classEventId } = use(params);
  const { data: classEvent, isLoading } = useClassEvent(classEventId);
  const createEnrollment = useCreateEnrollment();
  const confirmPayment = useConfirmPayment();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          <div className="space-y-4">
            <div className="h-3 w-24 bg-[#d1d5db] rounded" />
            <div className="h-8 w-80 bg-[#d1d5db] rounded" />
            <div className="h-48 bg-[#d1d5db] rounded" />
          </div>
          <div className="h-64 bg-[#d1d5db] rounded" />
        </div>
      </div>
    );
  }

  if (!classEvent) {
    return <div className="p-8 text-muted-foreground">Aula nao encontrada.</div>;
  }

  const teacher = classEvent.teacherProfile;
  const teacherName = teacher?.user?.name ?? "";
  const teacherInitials = teacherName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const price = formatPrice(classEvent.priceCents);

  async function handlePay() {
    setProcessing(true);
    try {
      // Step 1: Create enrollment
      const enrollment = await createEnrollment.mutateAsync({ classEventId });
      // Step 2: Confirm payment
      await confirmPayment.mutateAsync({ enrollmentId: enrollment.id });
      // Step 3: Redirect to success
      router.push(`/checkout/${classEventId}/sucesso`);
    } catch {
      // Error handled by mutation onError
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-10">
      <BackLink
        href={`/auloes/${classEventId}`}
        label="Voltar para a aula"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr,380px] lg:items-start">

        {/* Left: order summary */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">
              Revisao do pedido
            </p>
            <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {classEvent.title}
            </h1>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="default">{classEvent.institution?.shortName}</StatusPill>
            <StatusPill tone="muted">{classEvent.subject?.name}</StatusPill>
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
                {classEvent.durationMin} min de duracao
              </div>
            </div>

            {/* Teacher */}
            {teacher && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <TeacherAvatar
                    initials={teacherInitials}
                    photoUrl={teacher.photoUrl ?? undefined}
                    alt={teacherName}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-xs font-bold text-cyan-300"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{teacherName}</p>
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

        {/* Right: payment panel */}
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
          <button
            type="button"
            disabled={processing}
            onClick={handlePay}
            className="flex w-full items-center justify-center gap-2.5 rounded-md bg-[#ea580c] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:bg-[#c2410c] disabled:opacity-50"
          >
            <Lock size={14} />
            {processing ? "Processando..." : "Confirmar pagamento"}
          </button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
            <ShieldCheck size={12} />
            Pagamento seguro . Stripe . SSL
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
