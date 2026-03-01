"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";
import { useInstitutions, useSubjects } from "@/lib/queries/institutions";
import { useAuth } from "@/lib/auth-context";
import { TeacherAvatar } from "@/components/TeacherAvatar";

const input =
  "w-full bg-surface border border-border text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 transition-all duration-200";

const label =
  "block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60 mb-2";

function toggleId(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids.filter((entry) => entry !== id);
  }
  return [...ids, id];
}

export default function RegisterPage() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [institutionIds, setInstitutionIds] = useState<string[]>([]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const { data: institutions } = useInstitutions();
  const { data: subjects } = useSubjects();

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [name]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        role,
        institutionIds,
        subjectIds: role === "TEACHER" ? subjectIds : undefined,
      });
      router.push("/");
    } catch {
      // Error toast handled by auth context
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece seu perfil com instituicoes e materias."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Nome */}
        <div>
          <label htmlFor="name" className={label}>
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            placeholder="Seu nome"
            className={input}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className={input}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Celular + Tipo de conta */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.95fr,1.05fr]">
          <div>
            <label htmlFor="phone" className={label}>
              Celular
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              className={input}
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>
              Tipo de conta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`border px-2 py-3 text-[11px] font-bold uppercase tracking-[0.09em] whitespace-nowrap transition-colors sm:text-xs ${
                  role === "STUDENT"
                    ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Aluno
              </button>
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`border px-2 py-3 text-[11px] font-bold uppercase tracking-[0.09em] whitespace-nowrap transition-colors sm:text-xs ${
                  role === "TEACHER"
                    ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Professor
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={label}>
            {role === "TEACHER"
              ? "Instituicoes onde deseja lecionar"
              : "Instituicoes onde estuda"}
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
          <p className="mt-2 text-[10px] text-muted-foreground/55">
            Voce pode editar depois no perfil.
          </p>
        </div>

        {role === "TEACHER" && (
          <>
            <div>
              <label className={label}>Materias que voce leciona</label>
              <div className="flex flex-wrap gap-2">
                {(subjects ?? []).map((subject) => {
                  const active = subjectIds.includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() =>
                        setSubjectIds((prev) => toggleId(prev, subject.id))
                      }
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

            <div className="rounded-sm border border-border bg-surface/50 p-4">
              <label htmlFor="photo" className={label}>
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                <TeacherAvatar
                  initials={initials}
                  photoUrl={photoUrl}
                  alt="Previa da foto"
                  className="flex h-14 w-14 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
                />
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-[11px] file:font-semibold file:text-foreground hover:file:border-[#9ca3af]"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                />
              </div>
            </div>
          </>
        )}

        {/* Senha */}
        <div>
          <label htmlFor="password" className={label}>
            Senha
          </label>
          <input
            id="password"
            type="password"
            placeholder="Minimo 8 caracteres"
            className={input}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ea580c] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-[#c2410c] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground/50 tracking-wide">
        Ja tem uma conta?{" "}
        <Link
          href="/login"
          className="text-brand-accent font-semibold hover:opacity-70 transition-opacity duration-200"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
