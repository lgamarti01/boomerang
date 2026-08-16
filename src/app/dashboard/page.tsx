import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PendientesCobrador from "@/components/PendientesCobrador";
import QuitarAsignacion from "@/components/QuitarAsignacion";
import SignOutButton from "@/components/SignOutButton";
import CompletarContenedor from "@/components/CompletarContenedor";

export const dynamic = "force-dynamic";

const AVATAR_COLOR: Record<string, string> = {
  Vasallo: "bg-[#2A4FB0]",
  Pedro: "bg-teal",
  Jose: "bg-[#B0662A]",
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

function formatEur(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatImporte(pago: { importeUsd: any; importeEur: any }) {
  if (pago.importeUsd !== null) return formatUsd(Number(pago.importeUsd));
  if (pago.importeEur !== null) return formatEur(Number(pago.importeEur)) + " (sin tasa)";
  return "—";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const contenedor = await prisma.contenedor.findFirst({
    where: { estado: "ACTIVO" },
    include: {
      pagos: {
        include: { cobrador: true, cobradorAsignadoPor: true },
        orderBy: { fecha: "desc" },
      },
    },
  });

  const cobradores = await prisma.cobrador.findMany({ where: { activo: true } });

  if (!contenedor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="font-display text-lg mb-2">No hay ningún contenedor activo</p>
          <p className="text-steel text-sm">Da de alta un contenedor para empezar a registrar pagos.</p>
        </div>
      </div>
    );
  }

  const saldoInicial = Number(contenedor.saldoInicial);
  const totalFactura = Number(contenedor.totalFactura);

  const pagosDelContenedor = contenedor.pagos.filter((p) => p.importeUsd !== null);
  const pagosSinConversion = contenedor.pagos.filter((p) => p.importeUsd === null);
  const sumaPagos = round2(pagosDelContenedor.reduce((sum, p) => sum + Number(p.importeUsd), 0));
  const recibido = round2(saldoInicial + sumaPagos);
  const falta = round2(Math.max(totalFactura - recibido, 0));
  const excedente = round2(Math.max(recibido - totalFactura, 0));
  const pct = totalFactura > 0 ? Math.min(Math.round((recibido / totalFactura) * 100), 100) : 0;

  const pendientes = contenedor.pagos.filter((p) => !p.cobradorId);
  const ultimosPagos = contenedor.pagos.slice(0, 5);

  const objetivoPorCobrador = cobradores.length > 0 ? round2(totalFactura / cobradores.length) : 0;
  const desglose = cobradores.map((c) => {
    const pagosDeCobrador = pagosDelContenedor.filter((p) => p.cobradorId === c.id);
    const total = round2(pagosDeCobrador.reduce((sum, p) => sum + Number(p.importeUsd), 0));
    return { cobrador: c, total, count: pagosDeCobrador.length };
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:grid md:grid-cols-[240px_1fr]">
      {/* Topbar */}
      <div className="bg-navy-950 text-white px-4.5 py-4 flex items-center justify-between sticky top-0 z-20 md:col-span-2">
        <div className="font-display font-semibold text-base flex items-center gap-2">
          <span className="w-2 h-2 bg-amber rounded-sm" /> BOOMERANG
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-steel-light">
            <span className="w-[22px] h-[22px] rounded-full bg-amber text-[#241500] font-bold text-[11px] flex items-center justify-center font-body">
              {(session?.user?.name ?? "A")[0].toUpperCase()}
            </span>
            {session?.user?.name}
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Sidebar (desktop) */}
      <div className="hidden md:flex flex-col gap-1 bg-navy-950 text-white p-5.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber/10 text-white text-[13.5px] font-medium">
          <span>▤</span> Inicio
        </div>
        <Link
          href="/dashboard/importar"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-steel-light text-[13.5px] font-medium hover:bg-white/5"
        >
          <span>⇩</span> Importar pagos
        </Link>
        <Link
          href="/dashboard/pagos"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-steel-light text-[13.5px] font-medium hover:bg-white/5"
        >
          <span>📅</span> Pagos por fecha
        </Link>
      </div>

      <main className="max-w-3xl mx-auto md:mx-0 w-full px-4 py-5 md:px-10 md:py-8">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase text-steel mb-1.5">
              {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
            <h2 className="font-display text-[22px] font-semibold">Inicio</h2>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link
              href="/dashboard/pagos"
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-line bg-white text-[13px] font-semibold rounded-lg"
            >
              📅
            </Link>
            <Link
              href="/dashboard/importar"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-navy-950 text-white text-[13px] font-semibold rounded-lg"
            >
              ⇩ Importar
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-800 text-white rounded-2xl p-5 mb-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-display font-semibold text-[19px]">{contenedor.nombre}</div>
              <div className="font-mono text-[11.5px] text-steel-light mt-0.5">{contenedor.codigo}</div>
            </div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded border border-[#3FC79A] text-[#3FC79A] bg-teal/20">
              {contenedor.estado === "ACTIVO" ? "Activo" : contenedor.estado}
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-2.5">
            <div>
              <div className="font-mono text-[11px] text-steel-light mb-0.5">RECIBIDO (incl. saldo inicial)</div>
              <div className="font-mono text-[26px] font-semibold">{formatUsd(recibido)}</div>
            </div>
            <div className="text-right font-mono text-[13px] text-amber">
              {excedente > 0 ? "EXCEDENTE" : "FALTA"}
              <div className="text-base">{formatUsd(excedente > 0 ? excedente : falta)}</div>
            </div>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber to-[#3FC79A]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11.5px] text-steel-light font-mono">
            <span>{pct}% cobrado · saldo inicial {formatUsd(saldoInicial)}</span>
            <span>Total factura: {formatUsd(totalFactura)}</span>
          </div>
        </div>

        {excedente > 0 && (
          <div className="bg-teal-bg border border-[#CDE9DF] rounded-xl p-4 mb-4">
            <div className="text-[13px] text-[#0F5D45] mb-3">
              Este contenedor ha alcanzado el total de factura.{" "}
              <b className="font-mono">{formatUsd(excedente)}</b> de excedente — muévelo al siguiente
              contenedor cuando lo des de alta, y marca este como completado.
            </div>
            <CompletarContenedor contenedorId={contenedor.id} />
          </div>
        )}

        {pagosSinConversion.length > 0 && (
          <div className="bg-amber/10 border border-amber/30 rounded-xl p-3.5 mb-4 text-[13px] text-amber-ink">
            <b className="font-mono">{pagosSinConversion.length} pago(s)</b> sin tipo de cambio ese día
            todavía — no cuentan en el total recibido hasta que se cargue la tasa correspondiente.
          </div>
        )}

        {pendientes.length > 0 && (
          <div className="bg-alert-bg border border-[#F3C9C9] rounded-xl p-3.5 mb-4 flex items-center gap-2.5">
            <span>⚠️</span>
            <span className="text-[13px] text-[#8A2E2E]">
              <b className="font-mono">{pendientes.length} pago(s)</b> todavía sin cobrador asignado
            </span>
          </div>
        )}

        {pendientes.length > 0 && (
          <>
            <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel my-6 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-line">
              Pendientes de asignar cobrador
            </div>
            <PendientesCobrador
              pagos={pendientes.map((p) => ({
                id: p.id,
                persona: p.persona,
                fechaStr: p.fecha.toLocaleDateString("es-ES"),
                banco: p.banco,
                importeUsd: p.importeUsd !== null ? Number(p.importeUsd) : null,
                importeEur: p.importeEur !== null ? Number(p.importeEur) : null,
                tasaCambio: p.tasaCambio !== null ? Number(p.tasaCambio) : null,
              }))}
              cobradores={cobradores}
            />
          </>
        )}

        <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel my-6 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-line">
          Últimos pagos recibidos
        </div>
        <div className="bg-white border border-line rounded-xl px-4">
          {ultimosPagos.map((pago) => (
            <div key={pago.id} className="flex justify-between items-center py-3 border-b border-line last:border-0 gap-2.5">
              <div>
                <div className="font-semibold text-[13.5px]">{pago.persona}</div>
                <div className="font-mono text-xs text-steel mt-0.5">
                  {pago.fecha.toLocaleDateString("es-ES")} · {pago.banco}
                </div>
              </div>
              {pago.cobrador ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-teal-bg text-[#0F5D45] text-xs font-semibold px-2.5 py-1.5 rounded-full font-mono before:content-['✓'] before:text-[11px]">
                    {pago.cobrador.nombre}
                    {pago.cobradorAsignadoPor && (
                      <span className="opacity-60 font-normal">
                        · {pago.cobradorAsignadoPor.rol === "ADMIN" ? "Admin" : "Auto"}
                      </span>
                    )}
                  </span>
                  <QuitarAsignacion pagoId={pago.id} />
                </div>
              ) : (
                <span className="text-xs text-alert font-mono">sin asignar</span>
              )}
              <div className="font-mono font-semibold whitespace-nowrap">{formatImporte(pago)}</div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel my-6 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-line">
          Desglose por cobrador
        </div>
        {desglose.map(({ cobrador, total, count }) => (
          <Link
            key={cobrador.id}
            href={`/dashboard/cobradores/${cobrador.id}`}
            className="bg-white border border-line rounded-xl p-3.5 mb-2.5 flex items-center gap-3.5 active:bg-[#FAFBFC]"
          >
            <div
              className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center font-display font-semibold text-sm text-white flex-shrink-0 ${
                AVATAR_COLOR[cobrador.nombre] ?? "bg-steel"
              }`}
            >
              {cobrador.nombre[0]}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[14.5px]">{cobrador.nombre}</div>
              <div className="font-mono text-[11.5px] text-steel mt-0.5">{count} pagos asignados</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-base">{formatUsd(total)}</div>
              <div className="font-mono text-[11px] text-steel mt-0.5">objetivo {formatUsd(objetivoPorCobrador)}</div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
