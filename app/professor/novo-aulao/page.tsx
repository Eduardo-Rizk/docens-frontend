"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useInstitutions, useInstitutionSubjects } from "@/lib/queries/institutions";
import { useCreateClassEvent } from "@/lib/queries/teacher";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"
    >
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-brand-accent/40 focus:outline-none focus:ring-1 focus:ring-brand-accent/20";

const selectCls =
  "w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-brand-accent/40 focus:outline-none focus:ring-1 focus:ring-brand-accent/20";

export default function NovoAulaoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [unlimitedCapacity, setUnlimitedCapacity] = useState(false);
  const { data: institutions } = useInstitutions();
  const { data: subjects } = useInstitutionSubjects(selectedInstitutionId);
  const createClassEvent = useCreateClassEvent();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dateStr = form.get("data") as string;
    const timeStr = form.get("horario") as string;
    const startsAt = new Date(`${dateStr}T${timeStr}`).toISOString();

    createClassEvent.mutate(
      {
        title: form.get("titulo") as string,
        description: form.get("descricao") as string,
        institutionId: selectedInstitutionId,
        subjectId: selectedSubjectId,
        startsAt,
        durationMin: Number(form.get("duracao")),
        capacity: unlimitedCapacity ? null : Number(form.get("capacidade")),
        priceCents: Math.round(Number(form.get("preco")) * 100),
      },
      {
        onSuccess: () => setSubmitted(true),
      },
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-[#ea580c]/30 bg-[#ea580c]/10 text-[#ea580c]">
          <CheckCircle size={28} />
        </div>
        <h2 className="font-display text-3xl text-foreground">Aulão criado!</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Seu rascunho foi salvo. Revise os detalhes antes de publicar.
        </p>
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => router.push("/professor/auloes")}
            className="rounded-md bg-[#ea580c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#c2410c] transition-all"
          >
            Ver meus aulões
          </button>
          <button
            onClick={() => setSubmitted(false)}
            className="rounded-sm border border-border bg-surface px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-[#9ca3af] transition-all"
          >
            Criar outro aulão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Novo Aulão
        </h1>
        <p className="text-base text-muted-foreground">
          Preencha os dados e publique quando estiver pronto
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Left column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <FieldLabel htmlFor="titulo">Título do aulão</FieldLabel>
              <input
                id="titulo"
                name="titulo"
                type="text"
                required
                className={inputCls}
                placeholder="Ex: Cálculo Intensivo: Limites e Derivadas"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                required
                className={`${inputCls} resize-none leading-relaxed`}
                placeholder="Descreva o que o aluno vai aprender nesta aula..."
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="instituicao">Instituição</FieldLabel>
              <select
                id="instituicao"
                name="instituicao"
                required
                className={selectCls}
                value={selectedInstitutionId}
                onChange={(e) => {
                  setSelectedInstitutionId(e.target.value);
                  setSelectedSubjectId("");
                }}
              >
                <option value="">Selecione uma instituição</option>
                {(institutions ?? []).map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="materia">Matéria</FieldLabel>
              <select
                id="materia"
                name="materia"
                required
                className={selectCls}
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={!selectedInstitutionId}
              >
                <option value="">Selecione uma matéria</option>
                {(subjects ?? []).map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel htmlFor="data">Data</FieldLabel>
                <input id="data" name="data" type="date" required className={inputCls} />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="horario">Horário</FieldLabel>
                <input id="horario" name="horario" type="time" required className={inputCls} />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="duracao">Duração (minutos)</FieldLabel>
              <input
                id="duracao"
                name="duracao"
                type="number"
                min={30}
                max={300}
                step={15}
                required
                className={inputCls}
                placeholder="Ex: 90"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="capacidade">Capacidade (vagas)</FieldLabel>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={unlimitedCapacity}
                  onChange={(e) => setUnlimitedCapacity(e.target.checked)}
                  className="rounded border-border"
                />
                Sem limite de vagas
              </label>
              <input
                id="capacidade"
                name="capacidade"
                type="number"
                min={1}
                max={500}
                required={!unlimitedCapacity}
                disabled={unlimitedCapacity}
                className={`${inputCls} ${unlimitedCapacity ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="Ex: 50"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="preco">Preço (R$)</FieldLabel>
              <input
                id="preco"
                name="preco"
                type="number"
                min={0}
                step={0.01}
                required
                className={inputCls}
                placeholder="Ex: 149.00"
              />
              <p className="text-[10px] text-muted-foreground/50">
                O valor em reais que os alunos pagarão para se inscrever
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={createClassEvent.isPending}
            className="rounded-sm bg-[#ea580c] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#c2410c] disabled:opacity-50"
          >
            {createClassEvent.isPending ? "Criando..." : "Criar aulão"}
          </button>
          <p className="text-xs text-muted-foreground">
            Será salvo como rascunho -- você publica quando quiser
          </p>
        </div>
      </form>
    </div>
  );
}
