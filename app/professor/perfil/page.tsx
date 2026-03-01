"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useInstitutions, useSubjects } from "@/lib/queries/institutions";
import { useUpdateTeacherProfile } from "@/lib/queries/teacher";
import { TeacherAvatar } from "@/components/TeacherAvatar";

function toggleId(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids.filter((entry) => entry !== id);
  }
  return [...ids, id];
}

export default function TeacherPerfilPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: institutions } = useInstitutions();
  const { data: subjects } = useSubjects();
  const updateProfile = useUpdateTeacherProfile();

  const [bio, setBio] = useState("");
  const [institutionIds, setInstitutionIds] = useState<string[]>([]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  const initials = user?.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  const selectedInstitutionNames = useMemo(
    () =>
      institutionIds
        .map((id) => (institutions ?? []).find(i => i.id === id)?.shortName)
        .filter((shortName): shortName is string => Boolean(shortName)),
    [institutionIds, institutions],
  );
  const selectedSubjectNames = useMemo(
    () =>
      subjectIds
        .map((id) => (subjects ?? []).find(s => s.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [subjectIds, subjects],
  );

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({
      bio,
      institutionIds,
      subjectIds,
    });
  }

  if (authLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="space-y-3">
          <div className="h-10 w-32 bg-[#d1d5db] rounded" />
          <div className="h-4 w-64 bg-[#d1d5db] rounded" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-[#d1d5db] rounded" />
            ))}
          </div>
          <div className="h-64 bg-[#d1d5db] rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-muted-foreground">Perfil nao encontrado.</div>;
  }

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Perfil
        </h1>
        <p className="text-base text-muted-foreground">
          Informacoes exibidas para alunos nas paginas de aula
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,340px] lg:items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome (read-only) */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Nome de exibicao
            </label>
            <div className="flex items-center gap-3 rounded-sm border border-border/50 bg-surface/40 px-4 py-3">
              <p className="text-sm text-foreground">{user.name}</p>
              <span className="ml-auto text-[10px] text-muted-foreground/50">
                nao editavel
              </span>
            </div>
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Foto de perfil
            </label>
            <div className="flex items-center gap-4 rounded-sm border border-border bg-surface px-4 py-3">
              <TeacherAvatar
                initials={initials}
                photoUrl={photoUrl}
                alt={user.name}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
              />
              <input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-[11px] file:font-semibold file:text-foreground hover:file:border-[#9ca3af]"
              />
            </div>
          </div>

          {/* Instituicoes */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Instituicoes em que leciona
            </label>
            <div className="flex flex-wrap gap-2">
              {(institutions ?? []).map((institution) => {
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

          {/* Materias */}
          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Materias
            </label>
            <div className="flex flex-wrap gap-2">
              {(subjects ?? []).map((subject) => {
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
              placeholder="Descreva sua formacao e experiencia..."
            />
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center gap-2 rounded-md bg-[#ea580c] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#c2410c] disabled:opacity-50"
          >
            {updateProfile.isSuccess ? (
              <>
                <CheckCircle size={14} />
                Salvo
              </>
            ) : updateProfile.isPending ? (
              "Salvando..."
            ) : (
              "Salvar alteracoes"
            )}
          </button>
        </form>

        {/* Live preview */}
        <div className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Pre-visualizacao
          </p>
          <div className="flex items-start gap-5 rounded-sm border border-border bg-surface p-5">
            <TeacherAvatar
              initials={initials}
              photoUrl={photoUrl}
              alt={user.name}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
            />
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                Professor
              </p>
              <p className="font-display text-xl text-foreground">{user.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {bio || "Sua bio aparecera aqui."}
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
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/40">
            Assim os alunos veem seu card nas paginas de aulao
          </p>
        </div>
      </div>
    </div>
  );
}
