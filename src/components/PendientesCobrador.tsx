"use client";

import { useState, useMemo } from "react";
import AsignarCobrador from "@/components/AsignarCobrador";

type Cobrador = { id: string; nombre: string };

type PagoPendiente = {
  id: string;
  persona: string;
  fecha: string; // YYYY-MM-DD
  fechaStr: string;
  banco: string;
  importeUsd: number | null;
  importeEur: number | null;
  tasaCambio: number | null;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

function formatImporte(pago: PagoPendiente) {
  if (pago.importeUsd !== null) return formatUsd(pago.importeUsd);
  if (pago.importeEur !== null)
    return round2(pago.importeEur).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " € (sin tasa)";
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
  const [fechaFiltro, setFechaFiltro] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pagos.filter((p) => {
      const coincideNombre = !q || p.persona.toLowerCase().includes(q);
      const coincideFecha = !fechaFiltro || p.fecha === fechaFiltro;
      return coincideNombre && coincideFecha;
    });
  }, [busqueda, fechaFiltro, pagos]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] outline-none focus:border-navy-800"
        />
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="flex-shrink-0 px-2.5 py-2.5 bg-white border border-line rounded-lg text-[13px] font-mono outline-none focus:border-navy-800"
        />
        {fechaFiltro && (
          <button
            onClick={() => setFechaFiltro("")}
            className="flex-shrink-0 px-2.5 text-[11px] font-mono text-steel underline underline-offset-2"
          >
            Ver todas
          </button>
        )}
      </div>

      {filtrados.length === 0 && (
        <div className="text-[13px] text-steel py-4 text-center">
          No hay pagos pendientes que coincidan con los filtros.
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
                  {round2(pago.importeEur).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
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
