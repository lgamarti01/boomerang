"use client";

import { useState, useMemo } from "react";
import AsignarCobrador from "@/components/AsignarCobrador";
import QuitarAsignacion from "@/components/QuitarAsignacion";
import ReasignarContenedor from "@/components/ReasignarContenedor";

type PagoFecha = {
  id: string;
  persona: string;
  banco: string;
  contenedorId: string | null;
  contenedorNombre: string | null;
  cobradorNombre: string | null;
  etiquetaAsignacion: string | null;
  importeUsd: number | null;
  importeEur: number | null;
  tasaCambio: number | null;
  fechaTasaCambio: string | null;
  monedaOriginal: string;
};

const SIN_ASIGNAR = "__SIN_ASIGNAR__";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatMonto(n: number, simbolo: string) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + simbolo;
}

function importeOriginal(p: PagoFecha) {
  return p.monedaOriginal === "USD" ? p.importeUsd : p.importeEur;
}
function simboloOriginal(p: PagoFecha) {
  return p.monedaOriginal === "USD" ? "$" : "€";
}
function importeConvertido(p: PagoFecha) {
  return p.monedaOriginal === "USD" ? p.importeEur : p.importeUsd;
}
function simboloConvertido(p: PagoFecha) {
  return p.monedaOriginal === "USD" ? "€" : "$";
}

export default function ListaPagosFecha({
  pagos,
  contenedores,
  cobradores,
}: {
  pagos: PagoFecha[];
  contenedores: { id: string; nombre: string }[];
  cobradores: { id: string; nombre: string }[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCobrador, setFiltroCobrador] = useState("");
  const [montoFiltro, setMontoFiltro] = useState("");
  const [monedaFiltro, setMonedaFiltro] = useState<"EUR" | "USD">("EUR");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const montoBuscado = montoFiltro.trim().replace(",", ".");

    return pagos.filter((p) => {
      const coincideNombre = !q || p.persona.toLowerCase().includes(q);

      let coincideCobrador = true;
      if (filtroCobrador === SIN_ASIGNAR) coincideCobrador = !p.cobradorNombre;
      else if (filtroCobrador) coincideCobrador = p.cobradorNombre === filtroCobrador;

      let coincideMonto = true;
      if (montoBuscado) {
        const valor = monedaFiltro === "EUR" ? p.importeEur : p.importeUsd;
        coincideMonto = valor !== null && valor.toFixed(2).includes(montoBuscado);
      }

      return coincideNombre && coincideCobrador && coincideMonto;
    });
  }, [busqueda, filtroCobrador, montoFiltro, monedaFiltro, pagos]);

  const sinAsignar = pagos.filter((p) => !p.cobradorNombre).length;

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
        <select
          value={filtroCobrador}
          onChange={(e) => setFiltroCobrador(e.target.value)}
          className="flex-shrink-0 px-2.5 py-2.5 bg-white border border-line rounded-lg text-[13px] outline-none focus:border-navy-800 max-w-[130px]"
        >
          <option value="">Todos</option>
          <option value={SIN_ASIGNAR}>Sin asignar</option>
          {cobradores.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </select>
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

      <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel mb-3">
        {filtrados.length} pago(s) · {sinAsignar > 0 ? `${sinAsignar} sin cobrador asignado en total` : "todos asignados"}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center text-steel text-[13.5px] py-10">
          No hay pagos que coincidan con los filtros.
        </div>
      ) : (
        filtrados.map((pago) => {
          const original = importeOriginal(pago);
          const convertido = importeConvertido(pago);

          return (
            <div
              key={pago.id}
              className={`bg-white border rounded-xl p-3.5 mb-2.5 ${
                pago.cobradorNombre ? "border-line" : "border-[#F3C9C9] border-l-[3px] border-l-alert"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-[14.5px]">{pago.persona}</div>
                  <div className="font-mono text-[11.5px] text-steel mt-0.5">{pago.banco}</div>
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

              <div className="mb-3">
                <ReasignarContenedor
                  pagoId={pago.id}
                  contenedorId={pago.contenedorId}
                  contenedores={contenedores}
                />
              </div>

              {pago.cobradorNombre ? (
                <div className="flex items-center justify-between pt-3 border-t border-line">
                  <span className="inline-flex items-center gap-1.5 bg-teal-bg text-[#0F5D45] text-xs font-semibold px-2.5 py-1.5 rounded-full font-mono before:content-['✓'] before:text-[11px]">
                    {pago.cobradorNombre}
                    {pago.etiquetaAsignacion && (
                      <span className="opacity-60 font-normal"> · {pago.etiquetaAsignacion}</span>
                    )}
                  </span>
                  <QuitarAsignacion pagoId={pago.id} />
                </div>
              ) : (
                <AsignarCobrador pagoId={pago.id} cobradores={cobradores} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
