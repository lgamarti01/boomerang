"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuitarAsignacion({
  pagoId,
  label = "Quitar",
}: {
  pagoId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function quitar() {
    if (!confirm("¿Quitar la asignación de cobrador de este pago?")) return;
    setLoading(true);
    const res = await fetch(`/api/pagos/${pagoId}/desasignar`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "No se ha podido quitar la asignación");
    }
  }

  return (
    <button
      onClick={quitar}
      disabled={loading}
      className="text-[10.5px] font-mono text-alert underline underline-offset-2 disabled:opacity-50 flex-shrink-0"
    >
      {loading ? "..." : label}
    </button>
  );
}
