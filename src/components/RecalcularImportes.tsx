"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecalcularImportes() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function recalcular() {
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const res = await fetch("/api/pagos/recalcular", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo recalcular");
      }
      const data = await res.json();
      setMensaje(data.actualizados > 0 ? `${data.actualizados} pago(s) actualizado(s)` : "Ya estaban al día");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Error al recalcular");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex-shrink-0 text-right">
      <button
        onClick={recalcular}
        disabled={cargando}
        title="Recalcular importes con las últimas tasas"
        className="w-9 h-9 flex items-center justify-center bg-white border border-line rounded-lg disabled:opacity-60"
      >
        {cargando ? "…" : "↻"}
      </button>
      {mensaje && <div className="text-[10px] font-mono text-steel mt-1 max-w-[90px]">{mensaje}</div>}
      {error && <div className="text-[10px] font-mono text-alert mt-1 max-w-[90px]">{error}</div>}
    </div>
  );
}
