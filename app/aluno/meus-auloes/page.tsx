"use client";

import Link from "next/link";
import { ArrowRight, Radio, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { useStudentAgenda, type AgendaItem } from "@/lib/queries/student";
import { formatLongDate, formatTime } from "@/lib/format";

// --- Status badge ---

type AccessState = "NEEDS_PURCHASE" | "PENDING_PAYMENT" | "WAITING_RELEASE" | "CAN_ENTER";

function StatusBadge({
  access,
  isLive,
  isPast,
}: {
  access: AccessState;
  isLive: boolean;
  isPast: boolean;
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
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
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
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        <AlertCircle size={10} />
        Pagamento pendente
      </span>
    );
  }

  if (access === "CAN_ENTER") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <Radio size={10} />
        Pronto para entrar
      </span>
    );
  }

  return null;
}

// --- Class row ---

function isLiveNow(startsAt: string, durationMin: number) {
  const start = new Date(startsAt).getTime();
  const end = start + durationMin * 60 * 1000;
  const now = Date.now();
  return now >= start && now <= end;
}

function isEventPast(startsAt: string, durationMin: number) {
  const end = new Date(startsAt).getTime() + durationMin * 60 * 1000;
  return Date.now() > end;
}

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
  const muted = past;

  return (
    <Link
      href={`/auloes/${ce.id}?from=agenda`}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-sm border p-5 transition-all duration-150 sm:flex-row sm:items-center sm:gap-6 ${
        live
          ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
          : muted
          ? "border-border/50 bg-surface/40 hover:border-border hover:bg-surface"
          : confirmed
          ? "border-brand-accent/20 bg-brand-accent/[0.03] hover:border-brand-accent/40 hover:bg-brand-accent/[0.06]"
          : "border-border bg-surface hover:border-[#9ca3af] hover:bg-[#f3f4f6]"
      }`}
    >
      {confirmed && !live && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-accent/60 via-brand-accent/30 to-transparent" />
      )}

      {/* Date/time column */}
      <div className={`w-28 shrink-0 space-y-0.5 ${muted ? "opacity-50" : ""}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
          {formatLongDate(ce.startsAt).split(",")[0]}
        </p>
        <p className={`font-display text-2xl leading-none ${confirmed && !muted ? "text-brand-accent" : "text-foreground"}`}>
          {formatTime(ce.startsAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatLongDate(ce.startsAt).split(",").slice(1).join(",").trim()}
        </p>
      </div>

      <div className={`hidden h-12 w-px sm:block ${live ? "bg-red-500/20" : "bg-border"}`} />

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className={`font-display text-lg leading-snug ${muted ? "text-muted-foreground" : "text-foreground"}`}>
          {ce.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {ce.institution?.shortName}
          {ce.teacherProfile?.user?.name && (
            <> . <span className="text-muted-foreground/70">{ce.teacherProfile.user.name}</span></>
          )}
          <span className="ml-2 text-muted-foreground/50">. {ce.durationMin} min</span>
        </p>
      </div>

      {/* Status + arrow */}
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge access={access} isLive={live} isPast={past} />
        <ArrowRight
          size={14}
          className="text-muted-foreground/30 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-brand-accent"
        />
      </div>
    </Link>
  );
}

// --- Section header ---

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
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
  const totalActive = live.length + upcoming.length;

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
          {totalActive} aula{totalActive !== 1 ? "s" : ""} agendada{totalActive !== 1 ? "s" : ""}
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

          {/* Proximas aulas */}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <SectionHeader label="Proximas aulas" count={upcoming.length} />
              <div className="flex flex-col gap-2">
                {upcoming.map((item) => (
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
