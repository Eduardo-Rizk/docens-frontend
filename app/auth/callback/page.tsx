"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!tokenHash || !type) {
      setError("Link invalido ou expirado.");
      return;
    }

    fetch("/api/auth/verify-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenHash, type }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Token invalido ou expirado.");
        }
        router.replace(type === "recovery" ? "/nova-senha" : "/");
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <AuthLayout
        title="Erro na verificacao"
        subtitle="Nao foi possivel verificar o link."
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertCircle size={32} className="text-red-400" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">{error}</p>

          <Link
            href="/reset-password"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-accent hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={12} />
            Solicitar novo link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verificando..."
      subtitle="Estamos verificando seu link."
    >
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 size={32} className="animate-spin text-brand-accent" />
        <p className="text-sm text-muted-foreground">Aguarde um momento...</p>
      </div>
    </AuthLayout>
  );
}
