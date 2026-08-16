"use client";

import { useRouter } from "next/navigation";

export default function FiltroFecha({
  basePath,
  fecha,
}: {
  basePath: string;
  fecha?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={fecha ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `${basePath}?fecha=${v}` : basePath);
        }}
        className="px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] font-mono outline-none focus:border-navy-800"
      />
      {fecha && (
        <button
          onClick={() => router.push(basePath)}
          className="text-[11px] font-mono text-steel underline underline-offset-2"
        >
          Ver todas
        </button>
      )}
    </div>
  );
}
