"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompletarContenedor({ contenedorId }: { contenedorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function completar() {
    setLoading(true);
    const res = await fetch(`/api/contenedores/${contenedorId}/completar`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={completar}
      disabled={loading}
      className="text-[13px] font-semibold bg-navy-950 text-white px-4 py-2.5 rounded-lg disabled:opacity-60"
    >
      {loading ? "Marcando..." : "Marcar contenedor como Completado"}
    </button>
  );
}
