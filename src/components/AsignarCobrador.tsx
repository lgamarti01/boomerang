"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cobrador = { id: string; nombre: string };

const COLOR_BY_NOMBRE: Record<string, string> = {
  Vasallo: "text-[#2A4FB0]",
  Pedro: "text-teal",
  Adrian: "text-[#B0662A]",
};

export default function AsignarCobrador({
  pagoId,
  cobradores,
}: {
  pagoId: string;
  cobradores: Cobrador[];
}) {
  const router = useRouter();
  const [asignado, setAsignado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function asignar(cobrador: Cobrador) {
    setLoading(true);
    const res = await fetch(`/api/pagos/${pagoId}/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cobradorId: cobrador.id }),
    });
    setLoading(false);
    if (res.ok) {
      setAsignado(cobrador.nombre);
      router.refresh();
    }
  }

  if (asignado) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-teal-bg text-[#0F5D45] text-xs font-semibold px-2.5 py-1.5 rounded-full font-mono before:content-['✓'] before:text-[11px]">
        {asignado}
      </span>
    );
  }

  return (
    <div className="flex gap-1.5 flex-wrap mt-2.5">
      <span className="font-mono text-[10.5px] uppercase text-steel w-full mb-0.5">
        Asignar a:
      </span>
      {cobradores.map((c) => (
        <button
          key={c.id}
          disabled={loading}
          onClick={() => asignar(c)}
          className={`flex-1 min-w-[88px] py-2 px-1.5 rounded-lg border border-line bg-[#FAFBFC] text-[12.5px] font-semibold text-center disabled:opacity-50 ${
            COLOR_BY_NOMBRE[c.nombre] ?? ""
          }`}
        >
          {c.nombre}
        </button>
      ))}
    </div>
  );
}
