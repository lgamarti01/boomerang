"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !password.trim()) {
      setError("Introduce usuario y contraseña.");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      usuario,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_15%_15%,rgba(245,166,35,0.10),transparent_40%),linear-gradient(160deg,#0B1526_0%,#0F1D33_60%,#152B49_100%)]">
      <div className="w-full max-w-[380px] bg-navy-900 border border-white/10 rounded-2xl p-9 pt-9 pb-8 shadow-2xl">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-amber font-mono mb-6 before:content-[''] before:w-[18px] before:h-[2px] before:bg-amber">
          BOOMERANG MANAGEMENT
        </div>
        <h1 className="font-display text-2xl text-white font-semibold mb-1">Acceso al panel</h1>
        <p className="text-steel-light text-sm mb-7">
          Introduce tus credenciales de administrador para continuar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-wide text-steel-light font-mono mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full px-3.5 py-3 bg-white/[0.04] border border-white/[0.14] rounded-lg text-white text-[15px] outline-none focus:border-amber placeholder:text-[#4E5D74]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-wide text-steel-light font-mono mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-3 bg-white/[0.04] border border-white/[0.14] rounded-lg text-white text-[15px] outline-none focus:border-amber placeholder:text-[#4E5D74]"
            />
          </div>

          {error && (
            <div className="text-[12.5px] text-red-300 font-mono mb-3.5">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber text-[#241500] font-bold text-[14.5px] rounded-lg disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-5 flex items-center gap-2 text-xs text-steel-light font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-teal" /> Rol asignado: Administrador — acceso total
        </div>
      </div>
    </div>
  );
}
