"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  pagoId: string;
  fecha: string; // yyyy-mm-dd
  persona: string;
  importeOriginal: number | null;
  monedaOriginal: string; // 'EUR' | 'USD'
};

export default function EditarPago({ pagoId, fecha, persona, importeOriginal, monedaOriginal }: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nuevaFecha, setNuevaFecha] = useState(fecha);
  const [nuevaPersona, setNuevaPersona] = useState(persona);
  const [nuevoImporte, setNuevoImporte] = useState(importeOriginal !== null ? String(importeOriginal) : "");

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const body: Record<string, any> = {
        fecha: nuevaFecha,
        persona: nuevaPersona,
      };
      const importeNum = parseFloat(nuevoImporte.replace(",", "."));
      if (!isNaN(importeNum)) {
        if (monedaOriginal === "USD") body.importeUsd = importeNum;
        else body.importeEur = importeNum;
      }

      const res = await fetch(`/api/pagos/${pagoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar el pago");
      }

      setEditando(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm(`¿Seguro que quieres eliminar el pago de ${persona}? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    setError(null);
    try {
      const res = await fetch(`/api/pagos/${pagoId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar el pago");
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
      setEliminando(false);
    }
  }

  if (!editando) {
    return (
      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={() => setEditando(true)}
          className="text-[11px] font-mono text-steel underline underline-offset-2"
        >
          Editar
        </button>
        <button
          onClick={eliminar}
          disabled={eliminando}
          className="text-[11px] font-mono text-alert underline underline-offset-2 disabled:opacity-50"
        >
          {eliminando ? "Eliminando..." : "Eliminar"}
        </button>
        {error && <span className="text-[11px] font-mono text-alert">{error}</span>}
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-navy-50 border border-line rounded-lg space-y-2">
      <div>
        <label className="block text-[10.5px] font-mono uppercase text-steel mb-1">Fecha</label>
        <input
          type="date"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
          className="w-full px-2.5 py-2 bg-white border border-line rounded-lg text-[13px] outline-none focus:border-navy-800"
        />
      </div>
      <div>
        <label className="block text-[10.5px] font-mono uppercase text-steel mb-1">Persona</label>
        <input
          type="text"
          value={nuevaPersona}
          onChange={(e) => setNuevaPersona(e.target.value)}
          className="w-full px-2.5 py-2 bg-white border border-line rounded-lg text-[13px] outline-none focus:border-navy-800"
        />
      </div>
      <div>
        <label className="block text-[10.5px] font-mono uppercase text-steel mb-1">
          Importe original ({monedaOriginal === "USD" ? "$" : "€"})
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={nuevoImporte}
          onChange={(e) => setNuevoImporte(e.target.value)}
          className="w-full px-2.5 py-2 bg-white border border-line rounded-lg text-[13px] font-mono outline-none focus:border-navy-800"
        />
        <p className="text-[10.5px] text-steel mt-1">
          El importe convertido y la tasa de cambio no se recalculan automáticamente al editar.
        </p>
      </div>
      {error && <div className="text-[11px] font-mono text-alert">{error}</div>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex-1 px-3 py-2 bg-navy-950 text-white rounded-lg text-[12.5px] font-semibold disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={() => {
            setEditando(false);
            setNuevaFecha(fecha);
            setNuevaPersona(persona);
            setNuevoImporte(importeOriginal !== null ? String(importeOriginal) : "");
            setError(null);
          }}
          className="flex-1 px-3 py-2 bg-white border border-line rounded-lg text-[12.5px] font-semibold"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
