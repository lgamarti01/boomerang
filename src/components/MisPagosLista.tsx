"use client";

import { useState, useMemo } from "react";
import QuitarAsignacion from "@/components/QuitarAsignacion";

type Pago = {
  id: string;
  persona: string;
  fecha: string;
  fechaStr: string;
  banco: string;
  contenedorId: string;
  contenedorNombre: string;
  cobradorNombre: string | null;
  etiquetaAsignacion: string | null;
  importeUsd: number | null;
  importeEur: number | null;
  tasaCambio: number | null;
  fechaTasaCambio: string | null;
  monedaOriginal: string;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatMonto(n: number, simbolo: string) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + simbolo;
}

function importeOriginal(p: Pago) {
  return p.monedaOriginal === "USD" ? p.importeUsd : p.importeEur;
}
function simboloOriginal(p: Pago) {
  return p.monedaOriginal === "USD" ? "$" : "€";
}
function importeConvertido(p: Pago) {
  return p.monedaOriginal === "USD" ? p.importeEur : p.importeUsd;
}
function simboloConvertido(p: Pago) {
  return p.monedaOriginal === "USD" ? "€" : "$";
}

export default function MisPagosLista({ pagos }: { pagos: Pago[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [montoFiltro, setMontoFiltro] = useState("");
  const [monedaFiltro, setMonedaFiltro] = useState<"EUR" | "USD">("EUR");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const montoBuscado = montoFiltro.trim().replace(",", ".");

    return pagos.filter((p) => {
      const coincideNombre = !q || p.persona.toLowerCase().includes(q);
      const coincideFecha = !fechaFiltro || p.fecha === fechaFiltro;

      let coincideMonto = true;
      if (montoBuscado) {
        const valor = monedaFiltro === "EUR" ? p.importeEur : p.importeUsd;
        coincideMonto = valor !== null && valor.toFixed(2).includes(montoBuscado);
      }

      return coincideNombre && coincideFecha && coincideMonto;
    });
  }, [busqueda, fechaFiltro, montoFiltro, monedaFiltro, pagos]);

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
      <div className="flex gap-2 mb-2">
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

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          inputMode="decimal"
          value={montoFiltro}
          onChange={(e) => setMontoFiltro(e.target.value)}
          placeholder="Buscar por importe..."
          className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] font-mono outline-none focus:border-navy-800"
        />
        <div className="flex-shrink-0 flex border border-line rounded-lg overflow-hidden">
          <button
            onClick={() => setMonedaFiltro("EUR")}
            className={`px-3 py-2.5 text-[13px] font-mono font-semibold ${
              monedaFiltro === "EUR" ? "bg-navy-950 text-white" : "bg-white text-steel"
            }`}
          >
            €
          </button>
          <button
            onClick={() => setMonedaFiltro("USD")}
            className={`px-3 py-2.5 text-[13px] font-mono font-semibold ${
              monedaFiltro === "USD" ? "bg-navy-950 text-white" : "bg-white text-steel"
            }`}
          >
            $
          </button>
        </div>
      </div>

      {grupos.length === 0 ? (
        <div className="text-center text-steel text-[13.5px] py-6">No hay pagos que coincidan.</div>
      ) : (
        grupos.map((g) => (
          <div key={g.nombre} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-display font-semibold text-[15px]">{g.nombre}</div>
                <div className="font-mono text-[11px] text-steel">{g.pagos.length} pago(s)</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10.5px] text-steel uppercase">Total cobrado</div>
                <div className="font-mono font-bold text-[15px]">
                  {round2(g.total).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                </div>
              </div>
            </div>

            {g.pagos.map((pago) => {
              const original = importeOriginal(pago);
              const convertido = importeConvertido(pago);

              return (
                <div key={pago.id} className="bg-white border border-line rounded-xl p-3.5 mb-2.5">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="font-semibold text-[14.5px]">{pago.persona}</div>
                      <div className="font-mono text-[11.5px] text-steel mt-0.5">
                        {pago.fechaStr} · {pago.banco}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[15.5px]">
                        {original !== null ? formatMonto(original, simboloOriginal(pago)) : "—"}
                      </div>
                      {convertido !== null ? (
                        <div className="font-mono text-[10.5px] text-steel mt-0.5">
                          {formatMonto(convertido, simboloConvertido(pago))}
                          {pago.tasaCambio !== null && (
                            <>
                              {" "}
                              · tasa {pago.tasaCambio.toLocaleString("es-ES", { minimumFractionDigits: 4 })}
                              {pago.fechaTasaCambio && pago.fechaTasaCambio !== pago.fecha && (
                                <> ({new Date(pago.fechaTasaCambio).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })})</>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono text-[10.5px] text-steel mt-0.5">sin tasa ese día</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-line">
                    <span className="inline-flex items-center gap-1.5 bg-teal-bg text-[#0F5D45] text-xs font-semibold px-2.5 py-1.5 rounded-full font-mono before:content-['✓'] before:text-[11px]">
                      {pago.cobradorNombre ?? "—"}
                      {pago.etiquetaAsignacion && (
                        <span className="opacity-60 font-normal"> · {pago.etiquetaAsignacion}</span>
                      )}
                    </span>
                    <QuitarAsignacion pagoId={pago.id} label="Quitar" />
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
