"use client";

import { use } from "react";
import { Calendar, Clock } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { StatusPill } from "@/components/status-pill";
import { useBuyerList } from "@/lib/queries/teacher";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

export default function CompradoresPage({ params }: PageProps) {
  const { classEventId } = use(params);
  const { data, isLoading } = useBuyerList(classEventId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="space-y-3">
          <div className="h-3 w-40 bg-[#d1d5db] rounded" />
          <div className="h-8 w-80 bg-[#d1d5db] rounded" />
          <div className="h-4 w-48 bg-[#d1d5db] rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[#d1d5db] rounded-sm" />
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-muted-foreground">Dados nao encontrados.</div>;
  }

  const { classEvent, institution, subject, paidCount, buyers } = data;

  return (
    <div className="space-y-8">
      <BackLink href="/professor/auloes" label="Meus Auloes" />

      {/* Class info header */}
      <div className="space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
          {institution?.shortName} . {subject?.name}
        </p>
        <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
          {classEvent.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-brand-accent" />
            {formatLongDate(classEvent.startsAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-brand-accent" />
            {formatTime(classEvent.startsAt)}
          </span>
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
          Compradores
        </p>
        <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground/60">
          {paidCount} pagos
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {buyers.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">
            Nenhum comprador ainda
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Os alunos aparecerao aqui apos realizar a compra.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-border bg-surface divide-y divide-border">
          {buyers.map(({ enrollment, user, payment }) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={enrollment.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-[10px] font-bold text-muted-foreground">
                  {initials}
                </div>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                {/* Payment info */}
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm tabular-nums text-foreground">
                      {payment ? formatPrice(payment.amountCents) : "--"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {payment?.provider ?? "--"}
                    </p>
                  </div>
                  <StatusPill tone={enrollment.status === "PAID" ? "success" : "warn"}>
                    {enrollment.status === "PAID" ? "Pago" : "Pendente"}
                  </StatusPill>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
