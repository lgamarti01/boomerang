"use client";

import { useRouter } from "next/navigation";

export default function SelectorFecha({ fecha }: { fecha: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      defaultValue={fecha}
      onChange={(e) => router.push(`/dashboard/pagos?fecha=${e.target.value}`)}
      className="px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] font-mono outline-none focus:border-navy-800"
    />
  );
}
