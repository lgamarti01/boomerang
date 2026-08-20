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
      setMensaje(
        data.actualizados > 0
          ? `${data.actualizados} pago(s) actualizado(s) con una tasa mejor.`
          : "Todos los pagos ya tenían la mejor tasa disponible."
      );
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Error al recalcular");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        onClick={recalcular}
        disabled={cargando}
        className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-[13px] font-semibold text-navy-800 disabled:opacity-60"
      >
        {cargando ? "Recalculando..." : "Recalcular importes con las últimas tasas"}
      </button>
      {mensaje && <div className="text-[11.5px] font-mono text-steel mt-1.5">{mensaje}</div>}
      {error && <div className="text-[11.5px] font-mono text-alert mt-1.5">{error}</div>}
    </div>
  );
}
