"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Timer,
  Users,
  ExternalLink,
  Lock,
  Link as LinkIcon,
  Save,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { BackLink } from "@/components/BackLink";
import { useTeacherClassEvent, useUpdateClassEvent } from "@/lib/queries/teacher";
import { useInstitutions, useInstitutionSubjectsFlat } from "@/lib/queries/institutions";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ classEventId: string }>;
};

const publicationConfig: Record<string, { label: string; tone: "muted" | "success" | "warn" }> = {
  DRAFT: { label: "Rascunho", tone: "warn" },
  PUBLISHED: { label: "Publicado", tone: "success" },
  FINISHED: { label: "Finalizado", tone: "muted" },
};

const inputClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20";

const selectClass =
  "w-full rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 appearance-none";

/* ── Label for form fields ── */
function FieldLabel({ children, locked = false }: { children: React.ReactNode; locked?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
      {locked && <Lock size={10} className="text-muted-foreground/40" />}
      {children}
    </label>
  );
}

/* ── Read-only locked field ── */
function LockedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel locked>{label}</FieldLabel>
      <div className="rounded-md border border-border/50 bg-[#f9fafb] px-4 py-3 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

/* ── Section divider ── */
function SectionDivider({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-border" />
      <span
        className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accent ? "text-brand-accent" : "text-muted-foreground/50"}`}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function TeacherClassEventDetailPage({ params }: PageProps) {
  const { classEventId } = use(params);
  const router = useRouter();
  const { data: detail, isLoading } = useTeacherClassEvent(classEventId);
  const updateClassEvent = useUpdateClassEvent();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [unlimited, setUnlimited] = useState(false);
  const [priceCents, setPriceCents] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMin, setDurationMin] = useState<string>("");
  const [institutionId, setInstitutionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dirty, setDirty] = useState(false);

  // Data for selects (only fetched in DRAFT)
  const isDraftStatus = detail?.classEvent.publicationStatus === "DRAFT";
  const { data: institutions } = useInstitutions();
  const { data: subjects } = useInstitutionSubjectsFlat(institutionId);

  // Sync form state when data loads or updates
  useEffect(() => {
    if (detail) {
      const ce = detail.classEvent;
      setTitle(ce.title);
      setDescription(ce.description);
      setMeetingUrl(ce.meetingUrl ?? "");
      setCapacity(ce.capacity?.toString() ?? "");
      setUnlimited(ce.capacity === null);
      setPriceCents((ce.priceCents / 100).toFixed(2).replace(".", ","));
      setDurationMin(ce.durationMin.toString());
      setInstitutionId(detail.institution.id);
      setSubjectId(detail.subject.id);

      // Parse date and time from startsAt
      const dt = new Date(ce.startsAt);
      setDate(dt.toISOString().split("T")[0]); // YYYY-MM-DD
      setTime(
        dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
      );

      setDirty(false);
    }
  }, [detail]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="h-4 w-32 bg-[#d1d5db] rounded" />
        <div className="h-12 w-96 bg-[#d1d5db] rounded" />
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-[#d1d5db] rounded-md" />
          ))}
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
  const isFinished = classEvent.publicationStatus === "FINISHED";
  const canEdit = !isFinished;

  function handleAction(action: string) {
    updateClassEvent.mutate({ id: classEvent.id, action });
  }

  function parsePriceToCents(val: string): number {
    const cleaned = val.replace(/[^\d,\.]/g, "").replace(",", ".");
    return Math.round(parseFloat(cleaned) * 100) || 0;
  }

  function handleSave() {
    const updates: Record<string, unknown> = { id: classEvent.id };

    if (title.trim() !== classEvent.title) updates.title = title.trim();
    if (description.trim() !== classEvent.description) updates.description = description.trim();

    const newUrl = meetingUrl.trim();
    if (newUrl !== (classEvent.meetingUrl ?? "")) updates.meetingUrl = newUrl || undefined;

    if (isDraft) {
      // Capacity
      const newCap = unlimited ? null : parseInt(capacity, 10) || null;
      if (newCap !== classEvent.capacity) updates.capacity = newCap;

      // Price
      const newPrice = parsePriceToCents(priceCents);
      if (newPrice !== classEvent.priceCents) updates.priceCents = newPrice;

      // Duration
      const newDur = parseInt(durationMin, 10);
      if (newDur && newDur !== classEvent.durationMin) updates.durationMin = newDur;

      // Date + Time → startsAt
      if (date && time) {
        const newStartsAt = new Date(`${date}T${time}:00`).toISOString();
        const oldStartsAt = new Date(classEvent.startsAt).toISOString();
        if (newStartsAt !== oldStartsAt) updates.startsAt = newStartsAt;
      }

      // Institution
      if (institutionId !== institution.id) updates.institutionId = institutionId;

      // Subject
      if (subjectId !== subject.id) updates.subjectId = subjectId;
    }

    if (Object.keys(updates).length > 1) {
      updateClassEvent.mutate(updates as { id: string }, {
        onSuccess: () => router.push("/professor/auloes"),
      });
    }
  }

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <BackLink href="/professor/auloes" label="Meus Aulões" />
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={pub.tone}>{pub.label}</StatusPill>
          <StatusPill tone="muted">{institution.shortName}</StatusPill>
          <StatusPill tone="muted">{subject.name}</StatusPill>
        </div>
      </div>

      {/* Page title */}
      <h1 className="font-display text-3xl text-foreground">
        Editar Aulão
      </h1>

      {isFinished && (
        <div className="rounded-md border border-border bg-[#f9fafb] px-4 py-3 text-sm text-muted-foreground">
          Este aulão foi finalizado. Nenhuma edição é permitida.
        </div>
      )}

      {/* ═══ EDITABLE FIELDS ═══ */}
      {canEdit && (
        <div className="space-y-6">
          <SectionDivider label="Campos editáveis" accent />

          {/* Title */}
          <div className="space-y-1.5">
            <FieldLabel>Título</FieldLabel>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); markDirty(); }}
              className={inputClass + " font-display text-xl"}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <FieldLabel>Descrição</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty(); }}
              rows={4}
              className={inputClass + " resize-y leading-relaxed"}
            />
          </div>

          {/* Institution + Subject — DRAFT only */}
          {isDraft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel>Instituição</FieldLabel>
                <select
                  value={institutionId}
                  onChange={(e) => {
                    setInstitutionId(e.target.value);
                    setSubjectId(""); // reset subject when institution changes
                    markDirty();
                  }}
                  className={selectClass}
                >
                  {institutions?.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.shortName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Matéria</FieldLabel>
                <select
                  value={subjectId}
                  onChange={(e) => { setSubjectId(e.target.value); markDirty(); }}
                  className={selectClass}
                >
                  <option value="">Selecione...</option>
                  {subjects?.map((s) => (
                    <option key={s.subjectId} value={s.subjectId}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date + Time + Duration — DRAFT only */}
          {isDraft && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <FieldLabel>Data</FieldLabel>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); markDirty(); }}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Horário</FieldLabel>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => { setTime(e.target.value); markDirty(); }}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Duração (min)</FieldLabel>
                <input
                  type="number"
                  min={30}
                  max={300}
                  step={15}
                  value={durationMin}
                  onChange={(e) => { setDurationMin(e.target.value); markDirty(); }}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Price + Capacity — DRAFT only */}
          {isDraft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel>Preço (R$)</FieldLabel>
                <input
                  value={priceCents}
                  onChange={(e) => { setPriceCents(e.target.value); markDirty(); }}
                  placeholder="140,00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Capacidade (vagas)</FieldLabel>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={unlimited}
                    onChange={(e) => {
                      setUnlimited(e.target.checked);
                      if (e.target.checked) setCapacity("");
                      markDirty();
                    }}
                    className="h-4 w-4 rounded border-border accent-brand-accent"
                  />
                  <span className="text-sm text-foreground">Vagas ilimitadas</span>
                </label>
                {!unlimited && (
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => { setCapacity(e.target.value); markDirty(); }}
                    placeholder="Número de vagas"
                    className={inputClass}
                  />
                )}
              </div>
            </div>
          )}

          {/* Meeting URL */}
          <div className="space-y-1.5">
            <FieldLabel>Link do encontro (Google Meet)</FieldLabel>
            <div className="relative">
              <LinkIcon
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"
              />
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => { setMeetingUrl(e.target.value); markDirty(); }}
                placeholder="https://meet.google.com/..."
                className={inputClass + " pl-10"}
              />
            </div>
            {classEvent.meetingUrl && (
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                Status: {classEvent.meetingStatus === "RELEASED" ? "Liberado para alunos" : "Bloqueado — só você vê"}
              </p>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!dirty || updateClassEvent.isPending}
            className="flex items-center gap-2 rounded-md bg-[#ea580c] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#c2410c] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={15} />
            {updateClassEvent.isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      )}

      {/* ═══ FIXED FIELDS (only when PUBLISHED or FINISHED) ═══ */}
      {!isDraft && (
        <div className="space-y-6">
          <SectionDivider label={isFinished ? "Informações" : "Campos fixos"} />

          <div className="grid gap-4 sm:grid-cols-2">
            <LockedField label="Instituição">
              {institution.name}
            </LockedField>
            <LockedField label="Matéria">
              {subject.name}
            </LockedField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <LockedField label="Data">
              <span className="flex items-center gap-2">
                <Calendar size={13} className="text-muted-foreground/50" />
                {formatLongDate(classEvent.startsAt)}
              </span>
            </LockedField>
            <LockedField label="Horário">
              <span className="flex items-center gap-2">
                <Clock size={13} className="text-muted-foreground/50" />
                {formatTime(classEvent.startsAt)}
              </span>
            </LockedField>
            <LockedField label="Duração">
              <span className="flex items-center gap-2">
                <Timer size={13} className="text-muted-foreground/50" />
                {classEvent.durationMin} min
              </span>
            </LockedField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LockedField label="Preço">
              {formatPrice(classEvent.priceCents)}
            </LockedField>
            <LockedField label="Vagas">
              <span className="flex items-center gap-2">
                <Users size={13} className="text-muted-foreground/50" />
                {classEvent.soldSeats}/{classEvent.capacity ?? "∞"} vagas
                {classEvent.spotsLeft !== null && (
                  <span className="text-muted-foreground/40">
                    ({classEvent.spotsLeft} restante{classEvent.spotsLeft !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
            </LockedField>
          </div>

          {/* Meeting URL read-only for FINISHED */}
          {isFinished && classEvent.meetingUrl && (
            <LockedField label="Link do encontro">
              <a
                href={classEvent.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-cta hover:opacity-70 transition-opacity"
              >
                {classEvent.meetingUrl}
                <ExternalLink size={12} />
              </a>
            </LockedField>
          )}
        </div>
      )}

      {/* ═══ ACTIONS ═══ */}
      {!isFinished && (
        <div className="space-y-4">
          <SectionDivider label="Ações" />

          <div className="flex flex-wrap gap-3">
            {isDraft && (
              <button
                onClick={() => handleAction("publish")}
                disabled={updateClassEvent.isPending}
                className="rounded-md bg-[#22c55e] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#16a34a] disabled:opacity-50"
              >
                Publicar aulão
              </button>
            )}

            {isPublished && classEvent.meetingUrl && classEvent.meetingStatus === "LOCKED" && (
              <button
                onClick={() => handleAction("release-meeting")}
                disabled={updateClassEvent.isPending}
                className="rounded-md bg-[#3b82f6] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2563eb] disabled:opacity-50"
              >
                Liberar link para alunos
              </button>
            )}

            {isPublished && classEvent.meetingStatus === "RELEASED" && (
              <button
                onClick={() => handleAction("lock-meeting")}
                disabled={updateClassEvent.isPending}
                className="rounded-md border border-border px-5 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all hover:border-[#9ca3af] hover:text-foreground disabled:opacity-50"
              >
                Bloquear link
              </button>
            )}

            {isPublished && (
              <Link
                href={`/professor/auloes/${classEvent.id}/compradores`}
                className="flex items-center rounded-md border border-border px-5 py-3 text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:border-[#9ca3af]"
              >
                Ver compradores
              </Link>
            )}

            {isPublished && (
              <button
                onClick={() => handleAction("unpublish")}
                disabled={updateClassEvent.isPending}
                className="rounded-md border border-[#ef4444]/30 px-5 py-3 text-sm font-bold uppercase tracking-wider text-[#ef4444] transition-all hover:bg-[#ef4444]/5 disabled:opacity-50"
              >
                Despublicar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
