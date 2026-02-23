"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CheckCircle } from "lucide-react";
import {
  getInstitutionById,
  getSubjectById,
  getTeacherById,
  getUserById,
  institutions,
  subjects,
  viewer,
} from "@/lib/domain";
import { TeacherAvatar } from "@/components/TeacherAvatar";

const teacher = getTeacherById(viewer.teacherProfileId)!;
const user = getUserById(teacher.userId)!;

function toggleId(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids.filter((entry) => entry !== id);
  }
  return [...ids, id];
}

export default function TeacherPerfilPage() {
  const [photo, setPhoto] = useState(teacher.photo);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(teacher.photoUrl);
  const [headline, setHeadline] = useState(teacher.headline);
  const [bio, setBio] = useState(teacher.bio);
  const [institutionIds, setInstitutionIds] = useState(teacher.institutionIds);
  const [subjectIds, setSubjectIds] = useState(teacher.subjectIds);
  const [labels, setLabels] = useState(teacher.labels);
  const [labelInput, setLabelInput] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedInstitutionNames = useMemo(
    () =>
      institutionIds
        .map((institutionId) => getInstitutionById(institutionId)?.shortName)
        .filter((shortName): shortName is string => Boolean(shortName)),
    [institutionIds],
  );
  const selectedSubjectNames = useMemo(
    () =>
      subjectIds
        .map((subjectId) => getSubjectById(subjectId)?.name)
        .filter((name): name is string => Boolean(name)),
    [subjectIds],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function addLabel() {
    const normalized = labelInput.trim();
    if (!normalized || labels.includes(normalized)) return;
    setLabels((prev) => [...prev, normalized]);
    setLabelInput("");
  }

  function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return nextUrl;
    });
  }

  useEffect(() => {
    return () => {
      if (photoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Perfil
        </h1>
        <p className="text-base text-muted-foreground">
          Informações exibidas para alunos nas páginas de aula
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,340px] lg:items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome (read-only) */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Nome de exibição
            </label>
            <div className="flex items-center gap-3 rounded-sm border border-border/50 bg-surface/40 px-4 py-3">
              <p className="text-sm text-foreground">{user.name}</p>
              <span className="ml-auto text-[10px] text-muted-foreground/50">
                não editável
              </span>
            </div>
          </div>

          {/* Foto / Iniciais */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Foto de perfil
            </label>
            <div className="flex items-center gap-4 rounded-sm border border-border bg-surface px-4 py-3">
              <TeacherAvatar
                initials={photo || "??"}
                photoUrl={photoUrl}
                alt={user.name}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
              />
              <input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-[11px] file:font-semibold file:text-foreground hover:file:border-zinc-600"
              />
            </div>
          </div>

          {/* Avatar fallback */}
          <div className="space-y-2">
            <label
              htmlFor="photo"
              className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"
            >
              Iniciais (fallback)
            </label>
            <input
              id="photo"
              type="text"
              maxLength={2}
              value={photo}
              onChange={(e) => setPhoto(e.target.value.toUpperCase())}
              className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm font-bold uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:border-brand-accent/40 focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
              placeholder="Ex: LC"
            />
          </div>

          {/* Instituições */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Instituições em que leciona
            </label>
            <div className="flex flex-wrap gap-2">
              {institutions.map((institution) => {
                const active = institutionIds.includes(institution.id);
                return (
                  <button
                    key={institution.id}
                    type="button"
                    onClick={() =>
                      setInstitutionIds((prev) => toggleId(prev, institution.id))
                    }
                    className={`border px-3 py-2 text-[11px] font-semibold transition-colors ${
                      active
                        ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {institution.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matérias */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Matérias
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => {
                const active = subjectIds.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSubjectIds((prev) => toggleId(prev, subject.id))}
                    className={`border px-3 py-2 text-[11px] font-semibold transition-colors ${
                      active
                        ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {subject.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label
              htmlFor="labels"
              className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"
            >
              Labels
            </label>
            <div className="flex gap-2">
              <input
                id="labels"
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addLabel();
                  }
                }}
                className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-brand-accent/40 focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
                placeholder="Ex: FUVEST, Cálculo, Argumentação"
              />
              <button
                type="button"
                onClick={addLabel}
                className="border border-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
              >
                Add
              </button>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {labels.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setLabels((prev) => prev.filter((entry) => entry !== tag))
                    }
                    className="border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-accent"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <label
              htmlFor="headline"
              className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"
            >
              Especialidade
            </label>
            <input
              id="headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-brand-accent/40 focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
              placeholder="Ex: Direito e redação argumentativa"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-sm border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-brand-accent/40 focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
              placeholder="Descreva sua formação e experiência..."
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-sm bg-brand-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110"
          >
            {saved ? (
              <>
                <CheckCircle size={14} />
                Salvo
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        </form>

        {/* Live preview */}
        <div className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Pré-visualização
          </p>
          <div className="flex items-start gap-5 rounded-sm border border-border bg-surface p-5">
            <TeacherAvatar
              initials={photo || "??"}
              photoUrl={photoUrl}
              alt={user.name}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
            />
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                Professor
              </p>
              <div className="flex items-center gap-1.5">
                <p className="font-display text-xl text-foreground">{user.name}</p>
                {teacher.isVerified && (
                  <BadgeCheck size={16} className="shrink-0 text-brand-accent" />
                )}
              </div>
              <p className="mt-0.5 text-xs font-medium text-brand-accent/80">
                {headline || "Especialidade"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {bio || "Sua bio aparecerá aqui."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedInstitutionNames.map((institutionName) => (
                  <span
                    key={institutionName}
                    className="border border-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70"
                  >
                    {institutionName}
                  </span>
                ))}
                {selectedSubjectNames.map((subjectName) => (
                  <span
                    key={subjectName}
                    className="border border-brand-accent/30 bg-brand-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-accent"
                  >
                    {subjectName}
                  </span>
                ))}
                {labels.map((tag) => (
                  <span
                    key={tag}
                    className="border border-zinc-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/40">
            Assim os alunos veem seu card nas páginas de aulão
          </p>
        </div>
      </div>
    </div>
  );
}
