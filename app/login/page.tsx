"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSignIn, useUser } from "@clerk/nextjs";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  );
}

const input =
  "w-full bg-surface border border-border text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 transition-all duration-200";

const label =
  "block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60 mb-2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const { user, needsRegistration } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // If already fully logged in (Clerk + backend profile), redirect away
  // If signed in via Clerk but no backend profile, redirect to complete registration
  useEffect(() => {
    if (user) {
      router.replace(redirect);
    } else if (needsRegistration) {
      router.replace("/cadastro?oauth=1");
    }
  }, [user, needsRegistration, router, redirect]);

  const handleGoogleLogin = useCallback(async () => {
    if (!signIn) return;
    setGoogleLoading(true);
    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: redirect,
        redirectCallbackUrl: "/sso-callback",
      });
    } catch {
      toast.error("Erro ao conectar com Google.");
      setGoogleLoading(false);
    }
  }, [signIn, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    try {
      const { error } = await signIn.password({ identifier: email, password });

      if (error) {
        const message = error.longMessage || error.message;
        toast.error(message || "Email ou senha incorretos.");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl(redirect);
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
      } else {
        toast.error("Não foi possível completar o login.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { code?: string; longMessage?: string; message?: string }[] };
      const code = clerkError.errors?.[0]?.code;

      // Already signed in — redirect to home or registration
      if (code === "session_exists") {
        if (needsRegistration) {
          router.push("/cadastro?oauth=1");
        } else {
          router.push(redirect);
        }
        return;
      }

      const message = clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message;
      toast.error(message || "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  // Don't show login form if already signed in (redirecting)
  if (isSignedIn) {
    return null;
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para acessar seus auloes e mentorias."
    >
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 border border-border bg-surface text-foreground font-bold text-xs uppercase tracking-[0.14em] py-3.5 rounded-md hover:bg-surface/80 active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
      >
        <GoogleIcon className="h-4 w-4" />
        {googleLoading ? "Conectando..." : "Entrar com Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/40">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
        Não tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="inline-block py-2 px-1 text-brand-accent font-semibold hover:opacity-70 transition-opacity duration-200"
        >
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}
