"use client";

import { useState, useMemo } from "react";
import AsignarCobrador from "@/components/AsignarCobrador";
import QuitarAsignacion from "@/components/QuitarAsignacion";
import PagoAccionesMenu from "@/components/PagoAccionesMenu";
import RecalcularImportes from "@/components/RecalcularImportes";
import { round2, formatUsd, formatEur } from "@/lib/format";

type PagoFecha = {
  id: string;
  fecha: string;
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

function formatMonto(n: number, simbolo: string) {
  return simbolo === "$" ? formatUsd(n) : formatEur(n);
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
  const [filtroContenedor, setFiltroContenedor] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [mostrarMasFiltros, setMostrarMasFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCobrador, setFiltroCobrador] = useState("");
  const [montoFiltro, setMontoFiltro] = useState("");
  const [monedaFiltro, setMonedaFiltro] = useState<"EUR" | "USD">("EUR");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const montoBuscado = montoFiltro.trim().replace(",", ".");

    return pagos.filter((p) => {
      const coincideContenedor = !filtroContenedor || p.contenedorId === filtroContenedor;
      const coincideFecha = !filtroFecha || p.fecha === filtroFecha;
      const coincideNombre = !q || p.persona.toLowerCase().includes(q);

      let coincideCobrador = true;
      if (filtroCobrador === SIN_ASIGNAR) coincideCobrador = !p.cobradorNombre;
      else if (filtroCobrador) coincideCobrador = p.cobradorNombre === filtroCobrador;

      let coincideMonto = true;
      if (montoBuscado) {
        const valor = monedaFiltro === "EUR" ? p.importeEur : p.importeUsd;
        coincideMonto = valor !== null && valor.toFixed(2).includes(montoBuscado);
      }

      return coincideContenedor && coincideFecha && coincideNombre && coincideCobrador && coincideMonto;
    });
  }, [pagos, filtroContenedor, filtroFecha, busqueda, filtroCobrador, montoFiltro, monedaFiltro]);

  const hayFiltrosActivos = Boolean(
    filtroContenedor || filtroFecha || busqueda || filtroCobrador || montoFiltro
  );

  const totalUsd = round2(filtrados.reduce((sum, p) => sum + (p.importeUsd !== null ? p.importeUsd : 0), 0));
  const totalEur = round2(filtrados.reduce((sum, p) => sum + (p.importeEur !== null ? p.importeEur : 0), 0));
  const sinAsignarFiltrados = filtrados.filter((p) => !p.cobradorNombre).length;

  return (
    <div>
      <div className="bg-white border border-line rounded-xl p-3.5 mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] text-steel uppercase">
            {hayFiltrosActivos ? "Total filtrado" : "Total cargado en la app"}
          </div>
          <div className="font-mono font-semibold text-[22px] mt-0.5">{formatMonto(totalUsd, "$")}</div>
          <div className="font-mono text-[12.5px] text-steel mt-0.5">
            {formatMonto(totalEur, "€")} · {filtrados.length} pago(s)
            {sinAsignarFiltrados > 0 && ` · ${sinAsignarFiltrados} sin asignar`}
          </div>
        </div>
        <RecalcularImportes />
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-steel flex-shrink-0">📦</span>
        <select
          value={filtroContenedor}
          onChange={(e) => setFiltroContenedor(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-line rounded-lg text-[13px] outline-none focus:border-navy-800"
        >
          <option value="">Todos los contenedores</option>
          {contenedores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-steel flex-shrink-0">📅</span>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-line rounded-lg text-[13px] font-mono outline-none focus:border-navy-800"
        />
        {filtroFecha && (
          <button
            onClick={() => setFiltroFecha("")}
            className="flex-shrink-0 px-2 text-[11px] font-mono text-steel underline underline-offset-2"
          >
            Todas
          </button>
        )}
        <button
          onClick={() => setMostrarMasFiltros((v) => !v)}
          className="flex-shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white border border-line rounded-lg"
          title="Más filtros"
        >
          🔍
        </button>
      </div>

      {mostrarMasFiltros && (
        <div className="bg-white border border-line rounded-xl p-3 mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full mb-2 px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13.5px] outline-none focus:border-navy-800"
          />
          <div className="flex gap-2 mb-2">
            <select
              value={filtroCobrador}
              onChange={(e) => setFiltroCobrador(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-2.5 bg-white border border-line rounded-lg text-[13px] outline-none focus:border-navy-800"
            >
              <option value="">Todos los cobradores</option>
              <option value={SIN_ASIGNAR}>Sin asignar</option>
              {cobradores.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
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
        </div>
      )}

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
                  <div className="font-mono text-[11.5px] text-steel mt-0.5">
                    {new Date(pago.fecha).toLocaleDateString("es-ES")} · {pago.banco}
                  </div>
                </div>
                <div className="flex items-start gap-2">
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
                  <PagoAccionesMenu
                    pagoId={pago.id}
                    contenedorId={pago.contenedorId}
                    contenedores={contenedores}
                    fecha={pago.fecha}
                    persona={pago.persona}
                    importeOriginal={original}
                    monedaOriginal={pago.monedaOriginal}
                  />
                </div>
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
