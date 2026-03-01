import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BuyButton({
  classEventId,
  price,
}: {
  classEventId: string;
  price: string;
}) {
  return (
    <Link
      href={`/checkout/${classEventId}`}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ea580c] px-4 py-4 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:bg-[#c2410c]"
    >
      Garanta sua vaga · {price}
      <ArrowUpRight size={14} />
    </Link>
  );
}
