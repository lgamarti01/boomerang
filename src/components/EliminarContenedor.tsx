"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  contenedorId: string;
  nombre: string;
  numPagos: number;
};

export default function EliminarContenedor({ contenedorId, nombre, numPagos }: Props) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eliminar() {
    const mensajePagos =
      numPagos > 0
        ? ` Este contenedor tiene ${numPagos} pago(s) asociado(s) que también se eliminarán.`
        : "";
    const confirmado = confirm(
      `¿Seguro que quieres eliminar el contenedor "${nombre}"?${mensajePagos} Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setEliminando(true);
    setError(null);
    try {
      const res = await fetch(`/api/contenedores/${contenedorId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar el contenedor");
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
      setEliminando(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={eliminar}
        disabled={eliminando}
        className="text-[11.5px] font-mono text-alert underline underline-offset-2 disabled:opacity-50"
      >
        {eliminando ? "Eliminando..." : "Eliminar contenedor"}
      </button>
      {error && <span className="text-[11px] font-mono text-alert">{error}</span>}
    </div>
  );
}
