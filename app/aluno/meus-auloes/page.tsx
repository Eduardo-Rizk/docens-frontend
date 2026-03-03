"use client";

import Link from "next/link";
import { ArrowRight, Radio, CheckCircle, AlertCircle, Lock, Sparkles } from "lucide-react";
import { useStudentAgenda, type AgendaItem } from "@/lib/queries/student";
import { formatLongDate, formatTime, formatPrice } from "@/lib/format";

// --- Status badge ---

type AccessState = "NEEDS_PURCHASE" | "PENDING_PAYMENT" | "WAITING_RELEASE" | "CAN_ENTER";

function StatusBadge({
  access,
  isLive,
  isPast,
  priceCents,
}: {
  access: AccessState;
  isLive: boolean;
  isPast: boolean;
  priceCents?: number;
}) {
  if (isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        <CheckCircle size={10} />
        Concluida
      </span>
    );
  }

  if (isLive && access === "CAN_ENTER") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        Ao vivo agora
      </span>
    );
  }

  if (access === "WAITING_RELEASE") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          <CheckCircle size={10} />
          Vaga garantida
        </span>
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground/50">
          <Lock size={8} />
          link libera no horario
        </span>
      </div>
    );
  }

  if (access === "PENDING_PAYMENT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
        <AlertCircle size={10} />
        Pagamento pendente
      </span>
    );
  }

  if (access === "CAN_ENTER") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
        <Radio size={10} />
        Pronto para entrar
      </span>
    );
  }

  // NEEDS_PURCHASE — show price as CTA
  if (priceCents !== undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
        {formatPrice(priceCents)}
      </span>
    );
  }

  return null;
}

// --- Class row ---

function ClassRow({
  item,
  section,
}: {
  item: AgendaItem;
  section: "live" | "upcoming" | "history";
}) {
  const ce = item.classEvent;
  const live = section === "live";
  const past = section === "history";
  const access = item.accessState;
  const confirmed = access === "WAITING_RELEASE" || access === "CAN_ENTER";
  const pending = access === "PENDING_PAYMENT";
  const needsPurchase = access === "NEEDS_PURCHASE";
  const muted = past;

  // Left border color by state
  const leftBorderColor = live
    ? "bg-red-500"
    : confirmed
    ? "bg-emerald-500"
    : pending
    ? "bg-amber-500"
    : "";

  return (
    <Link
      href={`/auloes/${ce.id}?from=agenda`}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-sm border p-5 transition-all duration-150 sm:flex-row sm:items-center sm:gap-6 ${
        live
          ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
          : muted
          ? "border-border/50 bg-surface/40 hover:border-border hover:bg-surface"
          : confirmed
          ? "border-emerald-500/20 bg-emerald-500/[0.03] hover:border-emerald-500/40"
          : pending
          ? "border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-500/40"
          : needsPurchase
          ? "border-border/60 bg-surface/60 hover:border-brand-accent/30 hover:bg-brand-accent/[0.02]"
          : "border-border bg-surface hover:border-[#9ca3af]"
      }`}
    >
      {/* Colored left border strip */}
      {leftBorderColor && (
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${leftBorderColor}`} />
      )}

      {/* Date/time column */}
      <div className={`w-28 shrink-0 space-y-0.5 ${muted ? "opacity-50" : ""}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
          {formatLongDate(ce.startsAt).split(",")[0]}
        </p>
        <p className={`font-display text-2xl leading-none ${
          live
            ? "text-red-400"
            : confirmed
            ? "text-emerald-400"
            : pending
            ? "text-amber-400"
            : "text-foreground"
        }`}>
          {formatTime(ce.startsAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatLongDate(ce.startsAt).split(",").slice(1).join(",").trim()}
        </p>
      </div>

      <div className={`hidden h-12 w-px sm:block ${
        live ? "bg-red-500/20" : confirmed ? "bg-emerald-500/20" : pending ? "bg-amber-500/20" : "bg-border"
      }`} />

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className={`font-display text-lg leading-snug ${muted ? "text-muted-foreground" : "text-foreground"}`}>
          {ce.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.institution?.shortName}
          {item.teacher?.userName && (
            <> . <span className="text-muted-foreground/70">{item.teacher.userName}</span></>
          )}
          <span className="ml-2 text-muted-foreground/50">. {ce.durationMin} min</span>
        </p>
      </div>

      {/* Status + arrow */}
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge access={access} isLive={live} isPast={past} priceCents={ce.priceCents} />
        <ArrowRight
          size={14}
          className="text-muted-foreground/30 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-brand-accent"
        />
      </div>
    </Link>
  );
}

// --- Section header ---

function SectionHeader({
  label,
  count,
  icon,
  accentColor,
}: {
  label: string;
  count: number;
  icon?: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accentColor ?? "text-muted-foreground/60"}`}>
        {label}
      </p>
      <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground/60">
        {count}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

// --- Page ---

export default function StudentAgendaPage() {
  const { data: agenda, isLoading } = useStudentAgenda();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="space-y-3">
          <div className="h-3 w-20 bg-[#d1d5db] rounded" />
          <div className="h-10 w-48 bg-[#d1d5db] rounded" />
          <div className="h-4 w-60 bg-[#d1d5db] rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-[#d1d5db] rounded-sm" />
        ))}
      </div>
    );
  }

  const live = agenda?.live ?? [];
  const upcoming = agenda?.upcoming ?? [];
  const history = agenda?.history ?? [];

  // Split upcoming into enrolled vs available
  const enrolled = upcoming.filter(
    (i) => i.accessState === "WAITING_RELEASE" || i.accessState === "CAN_ENTER" || i.accessState === "PENDING_PAYMENT"
  );
  const available = upcoming.filter((i) => i.accessState === "NEEDS_PURCHASE");

  const totalEnrolled = live.length + enrolled.length;

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">
          Area do Aluno
        </p>
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Minha Agenda
        </h1>
        <p className="text-base text-muted-foreground">
          {totalEnrolled > 0 && (
            <span className="text-emerald-400">
              {totalEnrolled} aula{totalEnrolled !== 1 ? "s" : ""} confirmada{totalEnrolled !== 1 ? "s" : ""}
            </span>
          )}
          {totalEnrolled > 0 && available.length > 0 && (
            <span className="text-muted-foreground/50"> . </span>
          )}
          {available.length > 0 && (
            <span>{available.length} disponive{available.length !== 1 ? "is" : "l"}</span>
          )}
          {history.length > 0 && (
            <span className="ml-2 text-muted-foreground/50">. {history.length} no historico</span>
          )}
        </p>
        <Link
          href="/aluno/perfil"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-accent hover:opacity-80"
        >
          Editar perfil
          <ArrowRight size={12} />
        </Link>
      </header>

      {live.length === 0 && upcoming.length === 0 && history.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhuma aula comprada</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore as instituicoes e garanta sua vaga em uma aula.
          </p>
          <Link
            href="/explorar"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:opacity-70"
          >
            Explorar instituicoes
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Ao vivo agora */}
          {live.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  Ao vivo agora
                </span>
                <div className="flex-1 h-px bg-red-500/20" />
              </div>
              <div className="flex flex-col gap-2">
                {live.map((item) => (
                  <ClassRow key={item.classEvent.id} item={item} section="live" />
                ))}
              </div>
            </section>
          )}

          {/* Minhas aulas (enrolled) */}
          {enrolled.length > 0 && (
            <section className="space-y-3">
              <SectionHeader
                label="Minhas aulas"
                count={enrolled.length}
                icon={<CheckCircle size={12} className="text-emerald-400" />}
                accentColor="text-emerald-400"
              />
              <div className="flex flex-col gap-2">
                {enrolled.map((item) => (
                  <ClassRow key={item.classEvent.id} item={item} section="upcoming" />
                ))}
              </div>
            </section>
          )}

          {/* Disponiveis (needs purchase) */}
          {available.length > 0 && (
            <section className="space-y-3">
              <SectionHeader
                label="Disponiveis para voce"
                count={available.length}
                icon={<Sparkles size={12} className="text-brand-accent" />}
                accentColor="text-brand-accent"
              />
              <div className="flex flex-col gap-2">
                {available.map((item) => (
                  <ClassRow key={item.classEvent.id} item={item} section="upcoming" />
                ))}
              </div>
            </section>
          )}

          {/* Historico */}
          {history.length > 0 && (
            <section className="space-y-3">
              <SectionHeader label="Historico" count={history.length} />
              <div className="flex flex-col gap-2">
                {history.map((item) => (
                  <ClassRow key={item.classEvent.id} item={item} section="history" />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
