"use client";

import { useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useInstitutions } from "@/lib/queries/institutions";
import { useUpdateStudentProfile } from "@/lib/queries/student";

function toggleId(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids.filter((entry) => entry !== id);
  }
  return [...ids, id];
}

export default function StudentProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: institutions, isLoading: instLoading } = useInstitutions();
  const updateProfile = useUpdateStudentProfile();

  const [institutionIds, setInstitutionIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form from user once loaded
  if (user && !initialized) {
    setName(user.name);
    setInitialized(true);
  }

  const selectedInstitutionNames = useMemo(
    () =>
      institutionIds
        .map((institutionId) => (institutions ?? []).find(i => i.id === institutionId)?.shortName)
        .filter((shortName): shortName is string => Boolean(shortName)),
    [institutionIds, institutions],
  );

  if (authLoading || instLoading) {
    return (
      <div className="animate-pulse space-y-8 p-4">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-[#d1d5db] rounded" />
          <div className="h-4 w-96 bg-[#d1d5db] rounded" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            <div className="h-16 bg-[#d1d5db] rounded" />
            <div className="h-24 bg-[#d1d5db] rounded" />
          </div>
          <div className="h-40 bg-[#d1d5db] rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-muted-foreground">Perfil nao encontrado.</div>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({
      name,
      institutionIds,
    });
  }

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Perfil do Aluno
        </h1>
        <p className="text-base text-muted-foreground">
          Complete seu perfil com instituicoes para recomendacoes melhores.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:items-start">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Instituicoes
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

        <aside className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Pre-visualizacao
          </p>
          <div className="rounded-sm border border-border bg-surface p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
              {user.name}
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
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/45">
            Essas informacoes ajudam a personalizar recomendacoes de aulas.
          </p>
        </aside>
      </div>
    </div>
  );
}
