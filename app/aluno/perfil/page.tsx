"use client";

import { useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  getInstitutionById,
  getStudentProfileById,
  getUserById,
  institutions,
  viewer,
} from "@/lib/domain";

const studentProfile = getStudentProfileById(viewer.studentProfileId)!;
const user = getUserById(studentProfile.userId)!;

function toggleId(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids.filter((entry) => entry !== id);
  }
  return [...ids, id];
}

export default function StudentProfilePage() {
  const [institutionIds, setInstitutionIds] = useState(studentProfile.institutionIds);
  const [labels, setLabels] = useState(studentProfile.labels);
  const [labelInput, setLabelInput] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedInstitutionNames = useMemo(
    () =>
      institutionIds
        .map((institutionId) => getInstitutionById(institutionId)?.shortName)
        .filter((shortName): shortName is string => Boolean(shortName)),
    [institutionIds],
  );

  function addLabel() {
    const normalized = labelInput.trim();
    if (!normalized || labels.includes(normalized)) return;
    setLabels((prev) => [...prev, normalized]);
    setLabelInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Perfil do Aluno
        </h1>
        <p className="text-base text-muted-foreground">
          Complete seu perfil com instituições e labels para recomendações melhores.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:items-start">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
              Instituições
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
                placeholder="Ex: Medicina, Fase 2, Bolsas"
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

        <aside className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Pré-visualização
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
              {labels.map((tag) => (
                <span
                  key={tag}
                  className="border border-brand-accent/30 bg-brand-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/45">
            Essas informações ajudam a personalizar recomendações de aulas.
          </p>
        </aside>
      </div>
    </div>
  );
}
