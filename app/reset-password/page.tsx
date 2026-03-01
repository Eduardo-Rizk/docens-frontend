"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useResetPassword } from "@/lib/queries/auth";

const input =
  "w-full bg-surface border border-border text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 transition-all duration-200";

const label =
  "block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60 mb-2";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const resetPassword = useResetPassword();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetPassword.mutate(email, {
      onSuccess: () => setSent(true),
    });
  }

  if (sent) {
    return (
      <AuthLayout
        title="Email enviado"
        subtitle="Verifique sua caixa de entrada para redefinir sua senha."
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle size={32} className="text-emerald-700" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Enviamos um link de redefinicao de senha para
            </p>
            <p className="text-sm font-semibold text-foreground">{email}</p>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-accent hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={12} />
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Informe seu email e enviaremos um link para redefinir sua senha."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/40">
              <Mail size={16} />
            </div>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className={`${input} pl-10`}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={resetPassword.isPending}
          className="w-full bg-[#ea580c] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-[#c2410c] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
        >
          {resetPassword.isPending ? "Enviando..." : "Enviar link de redefinicao"}
        </button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground/50 tracking-wide">
        Lembrou a senha?{" "}
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
