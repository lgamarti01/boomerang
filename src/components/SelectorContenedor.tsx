"use client";

import { useRouter } from "next/navigation";

const ESTADO_LABEL: Record<string, string> = {
  ACTIVO: "Activo",
  COMPLETADO: "Completado",
  FACTURADO: "Facturado",
};

export default function SelectorContenedor({
  contenedorId,
  contenedores,
}: {
  contenedorId: string;
  contenedores: { id: string; nombre: string; estado: string }[];
}) {
  const router = useRouter();

  return (
    <select
      value={contenedorId}
      onChange={(e) => router.push(`/dashboard?contenedorId=${e.target.value}`)}
      className="bg-white/10 text-white text-[13px] font-mono rounded-lg px-2.5 py-1.5 outline-none border border-white/15"
    >
      {contenedores.map((c) => (
        <option key={c.id} value={c.id} className="text-ink">
          {c.nombre} ({ESTADO_LABEL[c.estado] ?? c.estado})
        </option>
      ))}
    </select>
  );
}
