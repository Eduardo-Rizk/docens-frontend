"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useUpdatePassword } from "@/lib/queries/auth";
import { toast } from "sonner";

const input =
  "w-full bg-surface border border-border text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 transition-all duration-200";

const label =
  "block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60 mb-2";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const updatePassword = useUpdatePassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas nao coincidem.");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter no minimo 8 caracteres.");
      return;
    }

    updatePassword.mutate(password, {
      onSuccess: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        toast.success("Senha atualizada com sucesso! Faca login com sua nova senha.");
        router.replace("/login");
      },
    });
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Digite sua nova senha para concluir a redefinicao."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className={label}>
            Nova senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/40">
              <Lock size={16} />
            </div>
            <input
              id="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              className={`${input} pl-10`}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className={label}>
            Confirmar senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/40">
              <Lock size={16} />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita a nova senha"
              className={`${input} pl-10`}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updatePassword.isPending}
          className="w-full bg-[#ea580c] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-[#c2410c] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
        >
          {updatePassword.isPending ? "Atualizando..." : "Redefinir senha"}
        </button>
      </form>
    </AuthLayout>
  );
}
