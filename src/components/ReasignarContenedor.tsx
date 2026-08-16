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
    <select
      value={contenedorId ?? ""}
      onChange={(e) => cambiar(e.target.value)}
      disabled={cargando}
      className="font-mono text-xs text-steel bg-transparent border-none outline-none underline underline-offset-2 disabled:opacity-50"
    >
      {!contenedorId && <option value="">sin contenedor</option>}
      {contenedores.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre}
        </option>
      ))}
    </select>
  );
}
