"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, ArrowRight, CalendarDays } from "lucide-react";
import { useClassEvent } from "@/lib/queries/class-events";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

export default function CheckoutSuccessPage({ params }: PageProps) {
  const { classEventId } = use(params);
  const { data: classEvent, isLoading } = useClassEvent(classEventId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-[#d1d5db] rounded-full" />
            <div className="h-8 w-64 bg-[#d1d5db] rounded" />
            <div className="h-4 w-48 bg-[#d1d5db] rounded" />
          </div>
          <div className="h-48 bg-[#d1d5db] rounded" />
        </div>
      </div>
    );
  }

  if (!classEvent) {
    return <div className="p-8 text-muted-foreground">Aula nao encontrada.</div>;
  }

  const teacherName = classEvent.teacherProfile?.user?.name ?? "";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="w-full max-w-lg space-y-8">

        {/* Success indicator */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle size={32} className="text-emerald-700" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">
              Pagamento confirmado!
            </h1>
            <p className="text-base text-muted-foreground">
              Sua vaga esta garantida. Ate la!
            </p>
          </div>
        </div>

        {/* Class summary card */}
        <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/[0.04] p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/70">
              {classEvent.institution?.shortName} . {classEvent.subject?.name}
            </p>
            <p className="font-display text-xl leading-snug text-foreground">
              {classEvent.title}
            </p>
            {teacherName && (
              <p className="text-sm text-muted-foreground">{teacherName}</p>
            )}
          </div>

          <div className="h-px bg-emerald-500/10" />

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <Calendar size={13} className="text-emerald-700" />
              {formatLongDate(classEvent.startsAt)}
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Clock size={13} className="text-emerald-700" />
              {formatTime(classEvent.startsAt)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">Valor pago</span>
            <span className="font-display text-lg text-foreground">
              {formatPrice(classEvent.priceCents)}
            </span>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          O link de acesso a aula sera liberado pelo professor no horario do encontro.
          Voce encontra tudo em <span className="text-foreground font-medium">Minha Agenda</span>.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/aluno/meus-auloes"
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#ea580c] px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:bg-[#c2410c]"
          >
            <CalendarDays size={14} />
            Ver minha agenda
          </Link>
          <Link
            href={`/auloes/${classEventId}?from=agenda`}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-[#9ca3af] hover:text-foreground"
          >
            Detalhes da aula
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
