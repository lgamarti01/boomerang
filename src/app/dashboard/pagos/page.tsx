import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SelectorFecha from "@/components/SelectorFecha";
import ListaPagosFecha from "@/components/ListaPagosFecha";

export const dynamic = "force-dynamic";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function PagosPorFechaPage({
  searchParams,
}: {
  searchParams: { fecha?: string };
}) {
  const fecha = searchParams.fecha || hoyISO();

  const pagos = await prisma.pago.findMany({
    where: { fecha: new Date(fecha) },
    include: { cobrador: true, contenedor: true, cobradorAsignadoPor: true },
    orderBy: { persona: "asc" },
  });

  const contenedores = await prisma.contenedor.findMany({
    select: { id: true, nombre: true },
    orderBy: { creadoEn: "desc" },
  });

  const cobradores = await prisma.cobrador.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
  });

  const totalUsd = round2(
    pagos.reduce((sum, p) => sum + (p.importeUsd !== null ? Number(p.importeUsd) : 0), 0)
  );

  const pagosSimplificados = pagos.map((p) => ({
    id: p.id,
    persona: p.persona,
    banco: p.banco,
    contenedorId: p.contenedorId,
    contenedorNombre: p.contenedor?.nombre ?? null,
    cobradorNombre: p.cobrador?.nombre ?? null,
    asignadoPorAdmin: p.cobradorAsignadoPor ? p.cobradorAsignadoPor.rol === "ADMIN" : null,
    importeUsd: p.importeUsd !== null ? Number(p.importeUsd) : null,
    importeEur: p.importeEur !== null ? Number(p.importeEur) : null,
  }));

  return (
    <div className="min-h-screen">
      <div className="bg-navy-950 text-white px-4.5 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="font-mono text-[13px] text-steel-light">
          ← Inicio
        </Link>
        <div className="font-display font-semibold text-base">Pagos por fecha</div>
        <div className="w-10" />
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <SelectorFecha fecha={fecha} />
          <div className="text-right">
            <div className="font-mono text-[11px] text-steel uppercase">Total ese día</div>
            <div className="font-mono font-bold text-lg">{formatUsd(totalUsd)}</div>
          </div>
        </div>

        {pagos.length === 0 ? (
          <div className="text-center text-steel text-[13.5px] py-10">
            No hay ningún pago registrado el {new Date(fecha).toLocaleDateString("es-ES")}.
          </div>
        ) : (
          <ListaPagosFecha pagos={pagosSimplificados} contenedores={contenedores} cobradores={cobradores} />
        )}
      </main>
    </div>
  );
}
