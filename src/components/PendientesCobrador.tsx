"use client";

import { useState, useMemo } from "react";
import AsignarCobrador from "@/components/AsignarCobrador";

type Cobrador = { id: string; nombre: string };

type PagoPendiente = {
  id: string;
  persona: string;
  fecha: string;
  fechaStr: string;
  banco: string;
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

function importeOriginal(pago: PagoPendiente) {
  return pago.monedaOriginal === "USD" ? pago.importeUsd : pago.importeEur;
}

function simboloOriginal(pago: PagoPendiente) {
  return pago.monedaOriginal === "USD" ? "$" : "€";
}

function importeConvertido(pago: PagoPendiente) {
  return pago.monedaOriginal === "USD" ? pago.importeEur : pago.importeUsd;
}

function simboloConvertido(pago: PagoPendiente) {
  return pago.monedaOriginal === "USD" ? "€" : "$";
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

      <div className="flex gap-2 mb-3">
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

      {filtrados.length === 0 && (
        <div className="text-[13px] text-steel py-4 text-center">
          No hay pagos pendientes que coincidan con los filtros.
        </div>
      )}

      {filtrados.map((pago) => {
        const original = importeOriginal(pago);
        const convertido = importeConvertido(pago);

        return (
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
                        {pago.fechaTasaCambio && (
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
            <AsignarCobrador pagoId={pago.id} cobradores={cobradores} />
          </div>
        );
      })}
    </div>
  );
}
