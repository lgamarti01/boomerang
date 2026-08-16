"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReasignarContenedor({
  pagoId,
  contenedorId,
  contenedores,
}: {
  pagoId: string;
  contenedorId: string | null;
  contenedores: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function cambiar(nuevoContenedorId: string) {
    if (!nuevoContenedorId || nuevoContenedorId === contenedorId) return;
    setCargando(true);
    const res = await fetch(`/api/pagos/${pagoId}/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenedorId: nuevoContenedorId }),
    });
    setCargando(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "No se ha podido reasignar el contenedor");
    }
  }

  return (
    <div>
      <div className="font-mono text-[10px] uppercase text-steel mb-1">Contenedor</div>
      <select
        value={contenedorId ?? ""}
        onChange={(e) => cambiar(e.target.value)}
        disabled={cargando}
        className="w-full px-3 py-2 bg-[#FAFBFC] border border-line rounded-lg text-[13px] font-medium outline-none focus:border-navy-800 disabled:opacity-50"
      >
        {!contenedorId && <option value="">Sin contenedor</option>}
        {contenedores.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
