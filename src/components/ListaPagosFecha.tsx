"use client";

import { useState, useMemo } from "react";
import QuitarAsignacion from "@/components/QuitarAsignacion";
import ReasignarContenedor from "@/components/ReasignarContenedor";

type PagoFecha = {
  id: string;
  persona: string;
  banco: string;
  contenedorId: string | null;
  contenedorNombre: string | null;
  cobradorNombre: string | null;
  asignadoPorAdmin: boolean | null;
  importeUsd: number | null;
  importeEur: number | null;
};

const AVATAR_COLOR: Record<string, string> = {
  Vasallo: "bg-[#2A4FB0]",
  Pedro: "bg-teal",
  Jose: "bg-[#B0662A]",
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

function formatImporte(pago: PagoFecha) {
  if (pago.importeUsd !== null) return formatUsd(pago.importeUsd);
  if (pago.importeEur !== null)
    return round2(pago.importeEur).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " € (sin tasa)";
  return "—";
}

export default function ListaPagosFecha({
  pagos,
  contenedores,
}: {
  pagos: PagoFecha[];
  contenedores: { id: string; nombre: string }[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pagos;
    return pagos.filter((p) => p.persona.toLowerCase().includes(q));
  }, [busqueda, pagos]);

  const sinAsignar = filtrados.filter((p) => !p.cobradorNombre).length;

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] outline-none focus:border-navy-800 mb-3"
      />

      <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel mb-2">
        {filtrados.length} pago(s) · {sinAsignar > 0 ? `${sinAsignar} sin cobrador asignado` : "todos asignados"}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center text-steel text-[13.5px] py-10">
          No hay pagos que coincidan con "{busqueda}".
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl px-4">
          {filtrados.map((pago) => (
            <div
              key={pago.id}
              className="flex justify-between items-center py-3 border-b border-line last:border-0 gap-2.5"
            >
              <div className="min-w-0">
                <div className="font-semibold text-[13.5px] truncate">{pago.persona}</div>
                <div className="font-mono text-xs text-steel mt-0.5 flex items-center gap-1">
                  {pago.banco} ·{" "}
                  <ReasignarContenedor
                    pagoId={pago.id}
                    contenedorId={pago.contenedorId}
                    contenedores={contenedores}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {pago.cobradorNombre ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 ${
                        AVATAR_COLOR[pago.cobradorNombre] ?? "bg-steel"
                      }`}
                      title={pago.cobradorNombre}
                    >
                      {pago.cobradorNombre[0]}
                    </span>
                    {pago.asignadoPorAdmin !== null && (
                      <span className="text-[9.5px] font-mono text-steel">
                        {pago.asignadoPorAdmin ? "Admin" : "Auto"}
                      </span>
                    )}
                    <QuitarAsignacion pagoId={pago.id} />
                  </div>
                ) : (
                  <span className="text-[11px] text-alert font-mono">sin asignar</span>
                )}
                <div className="font-mono font-semibold whitespace-nowrap text-[13.5px]">
                  {formatImporte(pago)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
