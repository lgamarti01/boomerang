"use client";

import { useState, useMemo } from "react";
import QuitarAsignacion from "@/components/QuitarAsignacion";

type Pago = {
  id: string;
  persona: string;
  fechaStr: string;
  banco: string;
  contenedorId: string;
  contenedorNombre: string;
  importeUsd: number | null;
  importeEur: number | null;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

function formatImporte(p: Pago) {
  if (p.importeUsd !== null) return formatUsd(p.importeUsd);
  if (p.importeEur !== null)
    return round2(p.importeEur).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " € (sin tasa)";
  return "—";
}

export default function MisPagosLista({ pagos }: { pagos: Pago[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pagos;
    return pagos.filter((p) => p.persona.toLowerCase().includes(q));
  }, [busqueda, pagos]);

  const grupos = useMemo(() => {
    const map = new Map<string, { nombre: string; pagos: Pago[]; total: number }>();
    for (const p of filtrados) {
      if (!map.has(p.contenedorId)) map.set(p.contenedorId, { nombre: p.contenedorNombre, pagos: [], total: 0 });
      const g = map.get(p.contenedorId)!;
      g.pagos.push(p);
      if (p.importeUsd !== null) g.total = round2(g.total + p.importeUsd);
    }
    return Array.from(map.values());
  }, [filtrados]);

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] outline-none focus:border-navy-800 mb-4"
      />

      {grupos.length === 0 ? (
        <div className="text-center text-steel text-[13.5px] py-6">No hay pagos que coincidan.</div>
      ) : (
        grupos.map((g) => (
          <div key={g.nombre} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-display font-semibold text-[15px]">{g.nombre}</div>
              <div className="text-right">
                <div className="font-mono text-[10.5px] text-steel uppercase">Total cobrado</div>
                <div className="font-mono font-bold text-[15px]">{formatUsd(g.total)}</div>
              </div>
            </div>
            <div className="bg-white border border-line rounded-xl px-4">
              {g.pagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex justify-between items-center py-3 border-b border-line last:border-0 gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[13.5px] truncate">{pago.persona}</div>
                    <div className="font-mono text-xs text-steel mt-0.5">
                      {pago.fechaStr} · {pago.banco}
                    </div>
                  </div>
                  <div className="font-mono font-semibold whitespace-nowrap text-[13.5px] flex-shrink-0 flex items-center gap-2">
                    {formatImporte(pago)}
                    <QuitarAsignacion pagoId={pago.id} label="Quitar" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
