"use client";

import { useAuth } from "@/lib/auth-context";
import { ProfessorNav } from "@/components/professor-nav";
import { TeacherAvatar } from "@/components/TeacherAvatar";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="h-12 w-12 bg-[#d1d5db] rounded-sm" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-[#d1d5db] rounded" />
            <div className="h-6 w-40 bg-[#d1d5db] rounded" />
          </div>
        </div>
        <div className="h-10 w-64 bg-[#d1d5db] rounded" />
        <div className="h-64 bg-[#d1d5db] rounded" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-muted-foreground">Nao autenticado.</div>;
  }

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Identity header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <TeacherAvatar
          initials={initials}
          photoUrl={undefined}
          alt={user.name}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
        />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Area do Professor
          </p>
          <p className="font-display text-xl text-foreground">{user.name}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <ProfessorNav />

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
