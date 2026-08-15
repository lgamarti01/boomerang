import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AsignarCobrador from "@/components/AsignarCobrador";
import SignOutButton from "@/components/SignOutButton";
import CompletarContenedor from "@/components/CompletarContenedor";

export const dynamic = "force-dynamic";

const AVATAR_COLOR: Record<string, string> = {
  Vasallo: "bg-[#2A4FB0]",
  Pedro: "bg-teal",
  Jose: "bg-[#B0662A]",
};

function formatUsd(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " $";
}

function formatImporte(pago: { importeUsd: any; importeEur: any }) {
  if (pago.importeUsd !== null) return formatUsd(Number(pago.importeUsd));
  if (pago.importeEur !== null) return Number(pago.importeEur).toLocaleString("es-ES") + " € (sin tasa)";
  return "—";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const contenedor = await prisma.contenedor.findFirst({
    where: { estado: "ACTIVO" },
    include: {
      pagos: {
        include: { cobrador: true },
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

  // Solo los pagos ya asociados a este contenedor cuentan para el recibido.
  const pagosDelContenedor = contenedor.pagos.filter((p) => p.importeUsd !== null);
  const pagosSinConversion = contenedor.pagos.filter((p) => p.importeUsd === null);
  const sumaPagos = pagosDelContenedor.reduce((sum, p) => sum + Number(p.importeUsd), 0);
  const recibido = saldoInicial + sumaPagos;
  const falta = Math.max(totalFactura - recibido, 0);
  const excedente = Math.max(recibido - totalFactura, 0);
  const pct = totalFactura > 0 ? Math.min(Math.round((recibido / totalFactura) * 100), 100) : 0;

  const pendientes = contenedor.pagos.filter((p) => !p.cobradorId);
  const ultimosPagos = contenedor.pagos.slice(0, 5);

  const objetivoPorCobrador = cobradores.length > 0 ? totalFactura / cobradores.length : 0;
  const desglose = cobradores.map((c) => {
    const pagosDeCobrador = pagosDelContenedor.filter((p) => p.cobradorId === c.id);
    const total = pagosDeCobrador.reduce((sum, p) => sum + Number(p.importeUsd), 0);
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
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-steel-light text-[13.5px] font-medium opacity-50">
          <span>⇩</span> Importar pagos
        </div>
      </div>

      <main className="max-w-3xl mx-auto md:mx-0 w-full px-4 py-5 md:px-10 md:py-8">
        <div className="mb-4">
          <div className="font-mono text-[11px] uppercase text-steel mb-1.5">
            {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
          <h2 className="font-display text-[22px] font-semibold">Inicio</h2>
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
            {pendientes.map((pago) => (
              <div
                key={pago.id}
                className="bg-white border border-[#F3C9C9] border-l-[3px] border-l-alert rounded-xl p-3.5 mb-2.5"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <div className="font-semibold text-[14.5px]">{pago.persona}</div>
                    <div className="font-mono text-[11.5px] text-steel mt-0.5">
                      {pago.fecha.toLocaleDateString("es-ES")} · {pago.banco}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[15.5px]">{formatImporte(pago)}</div>
                </div>
                <AsignarCobrador pagoId={pago.id} cobradores={cobradores} />
              </div>
            ))}
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
              <div className="text-right">
                <div className="font-mono font-semibold whitespace-nowrap">{formatImporte(pago)}</div>
                {pago.cobrador ? (
                  <span className="text-xs text-steel font-mono">{pago.cobrador.nombre}</span>
                ) : (
                  <span className="text-xs text-alert font-mono">sin asignar</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[11.5px] uppercase tracking-wide text-steel my-6 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-line">
          Desglose por cobrador
        </div>
        {desglose.map(({ cobrador, total, count }) => (
          <div key={cobrador.id} className="bg-white border border-line rounded-xl p-3.5 mb-2.5 flex items-center gap-3.5">
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
          </div>
        ))}
      </main>
    </div>
  );
}
