"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type Resultado = {
  banco: string;
  contenedor: string;
  totalFichero: number;
  nuevos: number;
  duplicados: number;
  sinTasa: number;
  pagosNuevos: { persona: string; fecha: string; importeEur: number | null; importeUsd: number | null }[];
};

export default function ImportarPagosPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function elegirArchivo(f: File | null) {
    setResultado(null);
    setError(null);
    setArchivo(f);
  }

  async function importar() {
    if (!archivo) return;
    setCargando(true);
    setError(null);
    setResultado(null);

    const fd = new FormData();
    fd.append("file", archivo);

    try {
      const res = await fetch("/api/pagos/importar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al importar el fichero");
      } else {
        setResultado(data);
        setArchivo(null);
      }
    } catch (e) {
      setError("No se ha podido conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-navy-950 text-white px-4.5 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="font-mono text-[13px] text-steel-light">
          ← Inicio
        </Link>
        <div className="font-display font-semibold text-base">Importar pagos</div>
        <div className="w-10" />
      </div>

      <main className="max-w-xl mx-auto w-full px-4 py-6">
        {/* Zona de selección de fichero */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#C9D2DE] rounded-2xl p-8 text-center bg-[#FBFCFD] cursor-pointer active:bg-[#F3F5F8]"
        >
          <div className="w-11 h-11 mx-auto mb-3 rounded-[10px] bg-navy-950 text-amber flex items-center justify-center text-lg">
            ⇧
          </div>
          <div className="font-display text-[15px] font-semibold mb-1">
            {archivo ? archivo.name : "Toca para elegir el fichero"}
          </div>
          <div className="text-[12.5px] text-steel mb-4">
            Extracto de movimientos en CSV o Excel (.xlsx)
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="px-4 py-2 border border-line rounded-lg text-[13px] font-semibold bg-white"
          >
            Seleccionar fichero
          </button>
        </div>

        {archivo && (
          <button
            onClick={importar}
            disabled={cargando}
            className="w-full mt-4 py-3.5 bg-amber text-[#241500] font-bold text-[14.5px] rounded-lg disabled:opacity-60"
          >
            {cargando ? "Importando..." : "Importar pagos"}
          </button>
        )}

        {error && (
          <div className="mt-4 bg-alert-bg border border-[#F3C9C9] rounded-xl p-3.5 text-[13.5px] text-[#8A2E2E]">
            {error}
          </div>
        )}

        {resultado && (
          <div className="mt-5">
            <div className="bg-teal-bg border border-[#CDE9DF] rounded-xl p-4 mb-4">
              <div className="font-display font-semibold text-[15px] text-[#0F5D45] mb-2">
                Importación completada — {resultado.banco}
              </div>
              <div className="text-[13px] text-[#0F5D45] space-y-1 font-mono">
                <div>Contenedor: {resultado.contenedor}</div>
                <div>Filas en el fichero: {resultado.totalFichero}</div>
                <div>✓ Pagos nuevos importados: {resultado.nuevos}</div>
                <div>· Duplicados (ya existían): {resultado.duplicados}</div>
                {resultado.sinTasa > 0 && <div>⚠ Sin tipo de cambio ese día: {resultado.sinTasa}</div>}
              </div>
            </div>

            {resultado.pagosNuevos.length > 0 && (
              <>
                <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel mb-2">
                  Pagos nuevos importados
                </div>
                <div className="bg-white border border-line rounded-xl px-4">
                  {resultado.pagosNuevos.map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-line last:border-0 gap-2">
                      <div>
                        <div className="font-semibold text-[13.5px]">{p.persona}</div>
                        <div className="font-mono text-xs text-steel mt-0.5">{p.fecha}</div>
                      </div>
                      <div className="font-mono font-semibold text-right whitespace-nowrap">
                        {p.importeUsd !== null
                          ? p.importeUsd.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $"
                          : p.importeEur !== null
                          ? p.importeEur.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " € (sin tasa)"
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Link
              href="/dashboard"
              className="block text-center mt-5 py-3 bg-navy-950 text-white font-semibold text-[13.5px] rounded-lg"
            >
              Ir al Inicio y asignar cobradores
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
