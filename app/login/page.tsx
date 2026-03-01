"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth-context";

const input =
  "w-full bg-surface border border-border text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 transition-all duration-200";

const label =
  "block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60 mb-2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch {
      // Error toast handled by auth context
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para acessar seus auloes e mentorias."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
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

        {/* Senha */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className={label} style={{ marginBottom: 0 }}>
              Senha
            </label>
            <Link
              href="/reset-password"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-accent hover:opacity-70 transition-opacity duration-200"
            >
              Esqueceu?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="........"
            className={input}
            autoComplete="current-password"
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
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground/50 tracking-wide">
        Nao tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="text-brand-accent font-semibold hover:opacity-70 transition-opacity duration-200"
        >
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}
