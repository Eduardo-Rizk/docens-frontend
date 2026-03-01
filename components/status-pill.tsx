type Tone = "default" | "success" | "warn" | "muted";

const toneClasses: Record<Tone, string> = {
  default: "bg-[#0f172a]/10 text-[#0f172a] border-[#0f172a]/20",
  success: "bg-success/10 text-success border-success/20",
  warn: "bg-warning/10 text-warning border-warning/20",
  muted: "bg-surface text-muted-foreground border-border",
};

export function StatusPill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] border rounded-md ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
