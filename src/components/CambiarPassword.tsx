"use client";

import { useState } from "react";

export default function CambiarPassword({ usuarioId, nombre }: { usuarioId: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function guardar() {
    if (password.length < 6) {
      setMensaje({ tipo: "error", texto: "Mínimo 6 caracteres" });
      return;
    }
    setCargando(true);
    setMensaje(null);
    const res = await fetch(`/api/usuarios/${usuarioId}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setCargando(false);
    if (res.ok) {
      setMensaje({ tipo: "ok", texto: "Contraseña actualizada" });
      setPassword("");
      setTimeout(() => {
        setAbierto(false);
        setMensaje(null);
      }, 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setMensaje({ tipo: "error", texto: data.error || "Error al guardar" });
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="text-[11.5px] font-mono text-navy-800 underline underline-offset-2"
      >
        Cambiar contraseña
      </button>
    );
  }

  return (
    <div className="mt-2.5 pt-2.5 border-t border-line">
      <div className="text-[11px] font-mono text-steel mb-1.5">Nueva contraseña para {nombre}</div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={mostrar ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            className="w-full px-3 py-2 pr-14 border border-line rounded-lg text-[13px] outline-none focus:border-navy-800"
          />
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            className="absolute right-0 top-0 h-full px-2.5 text-steel text-[11px] font-mono"
            tabIndex={-1}
          >
            {mostrar ? "Ocultar" : "Ver"}
          </button>
        </div>
        <button
          onClick={guardar}
          disabled={cargando}
          className="px-3.5 py-2 bg-navy-950 text-white text-[12.5px] font-semibold rounded-lg disabled:opacity-60"
        >
          {cargando ? "..." : "Guardar"}
        </button>
        <button
          onClick={() => {
            setAbierto(false);
            setPassword("");
            setMensaje(null);
          }}
          className="px-3 py-2 border border-line text-[12.5px] rounded-lg"
        >
          Cancelar
        </button>
      </div>
      {mensaje && (
        <div className={`text-[11.5px] font-mono mt-1.5 ${mensaje.tipo === "ok" ? "text-teal" : "text-alert"}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}
