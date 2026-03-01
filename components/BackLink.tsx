import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:border-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#0f172a]"
    >
      <ChevronLeft
        size={13}
        className="transition-transform duration-150 group-hover:-translate-x-0.5"
      />
      {label}
    </Link>
  );
}
