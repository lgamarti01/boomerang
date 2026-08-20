"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatUsd, formatEur } from "@/lib/format";

type Dato = { fecha: string; totalEur: number; totalUsd: number };
type Filtros = { contenedorId: string; rango: "30" | "todo" };

export default function GraficaPagosDiarios({
  datosIniciales,
  filtrosIniciales,
  contenedores,
}: {
  datosIniciales: Dato[];
  filtrosIniciales: Filtros;
  contenedores: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [datos, setDatos] = useState(datosIniciales);
  const [moneda, setMoneda] = useState<"EUR" | "USD">("EUR");
  const [cargando, setCargando] = useState(false);

  async function actualizar(nuevos: Filtros) {
    setFiltros(nuevos);
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (nuevos.contenedorId) params.set("contenedorId", nuevos.contenedorId);
      params.set("rango", nuevos.rango);
      const res = await fetch(`/api/estadisticas?${params.toString()}`);
      const data = await res.json();
      setDatos(data.datos);
      router.replace(`/dashboard/estadisticas?${params.toString()}`);
    } finally {
      setCargando(false);
    }
  }

  const totalPeriodo = datos.reduce(
    (acc, d) => ({ eur: acc.eur + d.totalEur, usd: acc.usd + d.totalUsd }),
    { eur: 0, usd: 0 }
  );

  const datosGrafica = datos.map((d) => ({
    fecha: new Date(d.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
    valor: moneda === "EUR" ? d.totalEur : d.totalUsd,
  }));

  return (
    <div>
      <div className="bg-white border border-line rounded-xl p-3.5 mb-4">
        <div className="font-mono text-[11px] text-steel uppercase mb-0.5">
          Total {filtros.rango === "30" ? "últimos 30 días" : "histórico"}
        </div>
        <div className="font-mono font-semibold text-[22px]">
          {moneda === "EUR" ? formatEur(totalPeriodo.eur) : formatUsd(totalPeriodo.usd)}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-steel flex-shrink-0">📦</span>
        <select
          value={filtros.contenedorId}
          onChange={(e) => actualizar({ ...filtros, contenedorId: e.target.value })}
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
        <div className="flex-1 flex border border-line rounded-lg overflow-hidden">
          <button
            onClick={() => actualizar({ ...filtros, rango: "30" })}
            className={`flex-1 py-2.5 text-[12.5px] font-mono font-semibold ${
              filtros.rango === "30" ? "bg-navy-950 text-white" : "bg-white text-steel"
            }`}
          >
            Últimos 30 días
          </button>
          <button
            onClick={() => actualizar({ ...filtros, rango: "todo" })}
            className={`flex-1 py-2.5 text-[12.5px] font-mono font-semibold ${
              filtros.rango === "todo" ? "bg-navy-950 text-white" : "bg-white text-steel"
            }`}
          >
            Todo el historial
          </button>
        </div>
        <div className="flex-shrink-0 flex border border-line rounded-lg overflow-hidden">
          <button
            onClick={() => setMoneda("EUR")}
            className={`px-3 py-2.5 text-[13px] font-mono font-semibold ${
              moneda === "EUR" ? "bg-navy-950 text-white" : "bg-white text-steel"
            }`}
          >
            €
          </button>
          <button
            onClick={() => setMoneda("USD")}
            className={`px-3 py-2.5 text-[13px] font-mono font-semibold ${
              moneda === "USD" ? "bg-navy-950 text-white" : "bg-white text-steel"
            }`}
          >
            $
          </button>
        </div>
      </div>

      {datosGrafica.length === 0 ? (
        <div className="text-center text-steel text-[13.5px] py-10">No hay pagos en este periodo.</div>
      ) : (
        <div
          className="bg-white border border-line rounded-xl p-3"
          style={{ height: 260, opacity: cargando ? 0.5 : 1 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafica} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip
                formatter={(value) => (moneda === "EUR" ? formatEur(Number(value)) : formatUsd(Number(value)))}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="valor" fill="#F5A623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
