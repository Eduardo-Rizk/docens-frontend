import { BadgeCheck } from "lucide-react";
import { getTeacherById, getUserById, viewer } from "@/lib/domain";
import { ProfessorNav } from "@/components/professor-nav";
import { TeacherAvatar } from "@/components/TeacherAvatar";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const teacher = getTeacherById(viewer.teacherProfileId)!;
  const user = getUserById(teacher.userId)!;

  return (
    <div className="space-y-8">
      {/* Identity header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <TeacherAvatar
          initials={teacher.photo}
          photoUrl={teacher.photoUrl}
          alt={user.name}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/20 text-sm font-bold text-cyan-300"
        />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Área do Professor
          </p>
          <div className="flex items-center gap-1.5">
            <p className="font-display text-xl text-foreground">{user.name}</p>
            {teacher.isVerified && (
              <BadgeCheck size={15} className="shrink-0 text-brand-accent" />
            )}
          </div>
          <p className="text-xs text-brand-accent/80">{teacher.headline}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <ProfessorNav />

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
