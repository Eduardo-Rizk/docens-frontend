import Link from "next/link";
import { notFound } from "next/navigation";
import { SubjectIcon } from "@/components/SubjectIcon";
import { BackLink } from "@/components/BackLink";
import {
  getInstitutionById,
  getSubjectById,
  getTeachersBySubjectAndInstitution,
  getNextClassEventForTeacher,
  getClassEventsBySubjectAndInstitution,
  getUserById,
  isClassSoldOut,
} from "@/lib/domain";
import { TeacherGrid, type TeacherCardData } from "@/components/TeacherGrid";

type PageProps = {
  params: Promise<{ institutionId: string; subjectId: string }>;
};

// Per-teacher accent palette: [bg/border class, text class, raw hex]
const AVATAR_PALETTE: Array<{
  cls: string;
  hex: string;
}> = [
  { cls: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",    hex: "#22d3ee" },
  { cls: "bg-purple-500/20 text-purple-300 border-purple-500/30", hex: "#a78bfa" },
  { cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", hex: "#34d399" },
  { cls: "bg-amber-500/20 text-amber-300 border-amber-500/30",  hex: "#fbbf24" },
  { cls: "bg-rose-500/20 text-rose-300 border-rose-500/30",    hex: "#fb7185" },
];

export default async function SubjectPage({ params }: PageProps) {
  const { institutionId, subjectId } = await params;

  const institution = getInstitutionById(institutionId);
  const subject = getSubjectById(subjectId);

  if (!institution || !subject) {
    notFound();
  }

  const teachers = getTeachersBySubjectAndInstitution(institutionId, subjectId);
  const allEvents = getClassEventsBySubjectAndInstitution(institutionId, subjectId);

  // Build serializable card data for the client component
  const teacherCards: TeacherCardData[] = teachers.map((teacher, index) => {
    const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
    const user = getUserById(teacher.userId);
    const nextEvent = getNextClassEventForTeacher(institutionId, subjectId, teacher.id);
    const teacherEvents = allEvents.filter((e) => e.teacherProfileId === teacher.id);
    const openCount = teacherEvents.filter((e) => !isClassSoldOut(e)).length;

    return {
      id: teacher.id,
      photo: teacher.photo,
      photoUrl: teacher.photoUrl,
      headline: teacher.headline,
      bio: teacher.bio,
      isVerified: teacher.isVerified,
      userName: user?.name ?? teacher.headline,
      avatarColor: palette.cls,
      avatarTextColor: "",
      accentHex: palette.hex,
      nextEvent,
      events: teacherEvents,
      openCount,
    };
  });

  return (
    <div className="space-y-12">
      {/* Breadcrumb + Header */}
      <header className="space-y-5">
        <BackLink href={`/instituicoes/${institutionId}`} label={institution.shortName} />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-sm border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {institution.type === "SCHOOL" ? "Ensino Médio" : "Graduação"}
            </span>
            <span className="text-xs text-muted-foreground">{institution.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <SubjectIcon name={subject.icon} size={36} className="text-brand-accent" />
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {subject.name}
            </h1>
          </div>

          <p className="text-base text-muted-foreground">
            {teachers.length > 0
              ? `${teachers.length} professor${teachers.length !== 1 ? "es" : ""} disponíve${teachers.length !== 1 ? "is" : "l"} · ${allEvents.length} aula${allEvents.length !== 1 ? "s" : ""} publicada${allEvents.length !== 1 ? "s" : ""}`
              : "Nenhum professor disponível no momento."}
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-brand-accent/40 via-brand-accent/10 to-transparent" />
      </header>

      {/* Teacher grid (client — handles filtering) */}
      {teachers.length === 0 ? (
        <div className="rounded-sm border border-border bg-surface p-12 text-center">
          <p className="font-display text-2xl text-foreground">Nenhum professor cadastrado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda não há professores com aulas publicadas para esta matéria.
          </p>
          <Link
            href={`/instituicoes/${institutionId}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:opacity-70"
          >
            Ver outras matérias
          </Link>
        </div>
      ) : (
        <TeacherGrid
          teachers={teacherCards}
          institutionId={institutionId}
        />
      )}
    </div>
  );
}
