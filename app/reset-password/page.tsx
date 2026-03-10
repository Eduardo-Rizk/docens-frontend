"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, KeyRound, ArrowLeft, AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

const input =
  "w-full bg-surface border border-border text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 transition-all duration-200";

const label =
  "block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60 mb-2";

export default function ResetPasswordPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "code" | "newPassword">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Create sign-in with reset strategy and send code
  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");
    try {
      // Identify the user first
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setError(createError.longMessage || createError.message || "Erro ao enviar código.");
        return;
      }
      // Send the reset code
      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(sendError.longMessage || sendError.message || "Erro ao enviar código.");
        return;
      }
      setStep("code");
      toast.success("Código enviado! Verifique seu email.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string; message?: string }[] };
      setError(clerkErr?.errors?.[0]?.longMessage || clerkErr?.errors?.[0]?.message || "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify the code
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyError) {
        setError(verifyError.longMessage || "Código inválido ou expirado.");
        return;
      }
      if (signIn.status === "needs_new_password") {
        setStep("newPassword");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string; message?: string }[] };
      setError(clerkErr?.errors?.[0]?.longMessage || clerkErr?.errors?.[0]?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Submit new password
  async function handleSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (submitError) {
        setError(submitError.longMessage || submitError.message || "Erro ao redefinir senha.");
        return;
      }
      if (signIn.status === "complete") {
        toast.success("Senha redefinida com sucesso!");
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
      }
    } catch (err: unknown) {
      // Clerk throws errors with { errors: [{ longMessage, message }] }
      const clerkErr = err as { errors?: { longMessage?: string; message?: string }[] };
      const msg = clerkErr?.errors?.[0]?.longMessage || clerkErr?.errors?.[0]?.message || "Erro ao redefinir senha.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Step 3: New password form
  if (step === "newPassword") {
    return (
      <AuthLayout
        title="Nova senha"
        subtitle="Escolha uma nova senha para sua conta."
      >
        <form className="space-y-5" onSubmit={handleSubmitPassword}>
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
                placeholder="Mínimo 8 caracteres"
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
              Confirmar nova senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/40">
                <Lock size={16} />
              </div>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                className={`${input} pl-10`}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1.5 text-[11px] text-red-400">
                As senhas não coincidem
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-[12px] leading-relaxed text-red-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ea580c] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-[#c2410c] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
          >
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </form>
      </AuthLayout>
    );
  }

  // Step 2: Code verification form
  if (step === "code") {
    return (
      <AuthLayout
        title="Verificar código"
        subtitle="Digite o código enviado para seu email."
      >
        <form className="space-y-5" onSubmit={handleVerifyCode}>
          <div>
            <label htmlFor="code" className={label}>
              Código de verificação
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/40">
                <KeyRound size={16} />
              </div>
              <input
                id="code"
                type="text"
                placeholder="123456"
                className={`${input} pl-10`}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-[12px] leading-relaxed text-red-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ea580c] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-[#c2410c] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/50 tracking-wide">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
            }}
            className="inline-flex items-center gap-1 text-brand-accent font-semibold hover:opacity-70 transition-opacity duration-200"
          >
            <ArrowLeft size={10} />
            Voltar
          </button>
        </p>
      </AuthLayout>
    );
  }

  // Step 1: Email form
  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Informe seu email e enviaremos um código para redefinir sua senha."
    >
      <form className="space-y-5" onSubmit={handleRequestCode}>
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

        {error && (
          <p className="text-[11px] text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ea580c] text-white font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-[#c2410c] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar código de redefinição"}
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
