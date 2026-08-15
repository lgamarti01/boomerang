"use client";

import { useState, useMemo } from "react";
import AsignarCobrador from "@/components/AsignarCobrador";

type Cobrador = { id: string; nombre: string };

type PagoPendiente = {
  id: string;
  persona: string;
  fechaStr: string;
  banco: string;
  importeUsd: number | null;
  importeEur: number | null;
  tasaCambio: number | null;
};

function formatUsd(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " $";
}

function formatImporte(pago: PagoPendiente) {
  if (pago.importeUsd !== null) return formatUsd(pago.importeUsd);
  if (pago.importeEur !== null) return pago.importeEur.toLocaleString("es-ES") + " € (sin tasa)";
  return "—";
}

export default function PendientesCobrador({
  pagos,
  cobradores,
}: {
  pagos: PagoPendiente[];
  cobradores: Cobrador[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pagos;
    return pagos.filter((p) => p.persona.toLowerCase().includes(q));
  }, [busqueda, pagos]);

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] outline-none focus:border-navy-800 mb-3"
      />

      {filtrados.length === 0 && (
        <div className="text-[13px] text-steel py-4 text-center">
          No hay pagos pendientes que coincidan con "{busqueda}".
        </div>
      )}

      {filtrados.map((pago) => (
        <div
          key={pago.id}
          className="bg-white border border-[#F3C9C9] border-l-[3px] border-l-alert rounded-xl p-3.5 mb-2.5"
        >
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <div className="font-semibold text-[14.5px]">{pago.persona}</div>
              <div className="font-mono text-[11.5px] text-steel mt-0.5">
                {pago.fechaStr} · {pago.banco}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[15.5px]">{formatImporte(pago)}</div>
              {pago.importeEur !== null && (
                <div className="font-mono text-[10.5px] text-steel mt-0.5">
                  {pago.importeEur.toLocaleString("es-ES")} €
                  {pago.tasaCambio !== null ? (
                    <> · tasa {pago.tasaCambio.toLocaleString("es-ES", { minimumFractionDigits: 4 })}</>
                  ) : (
                    <> · sin tasa ese día</>
                  )}
                </div>
              )}
            </div>
          </div>
          <AsignarCobrador pagoId={pago.id} cobradores={cobradores} />
        </div>
      ))}
    </div>
  );
}
