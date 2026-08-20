"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatUsd, formatEur } from "@/lib/format";

type Pago = {
  id: string;
  persona: string;
  fechaStr: string;
  banco: string;
  importeUsd: number | null;
  importeEur: number | null;
  contenedorNombre: string | null;
};

function formatImporte(p: Pago) {
  if (p.importeUsd !== null) return formatUsd(p.importeUsd);
  if (p.importeEur !== null) return formatEur(p.importeEur) + " (sin tasa)";
  return "—";
}

export default function PendientesAutoasignar({
  pagos,
  cobradorId,
}: {
  pagos: Pago[];
  cobradorId: string;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [asignando, setAsignando] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pagos;
    return pagos.filter((p) => p.persona.toLowerCase().includes(q));
  }, [busqueda, pagos]);

  async function asignarme(id: string) {
    setAsignando(id);
    const res = await fetch(`/api/pagos/${id}/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cobradorId }),
    });
    setAsignando(null);
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] outline-none focus:border-navy-800 mb-3"
      />

      {filtrados.length === 0 ? (
        <div className="text-center text-steel text-[13.5px] py-6">
          No hay pagos pendientes que coincidan.
        </div>
      ) : (
        filtrados.map((pago) => (
          <div
            key={pago.id}
            className="bg-white border border-[#F3C9C9] border-l-[3px] border-l-alert rounded-xl p-3.5 mb-2.5"
          >
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <div className="font-semibold text-[14.5px]">{pago.persona}</div>
                <div className="font-mono text-[11.5px] text-steel mt-0.5">
                  {pago.fechaStr} · {pago.banco} · {pago.contenedorNombre ?? "sin contenedor"}
                </div>
              </div>
              <div className="font-mono font-bold text-[15.5px]">{formatImporte(pago)}</div>
            </div>
            <button
              onClick={() => asignarme(pago.id)}
              disabled={asignando === pago.id}
              className="w-full py-2.5 bg-navy-950 text-white text-[13px] font-semibold rounded-lg disabled:opacity-60"
            >
              {asignando === pago.id ? "Asignando..." : "Asignármelo"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
