import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SelectorFecha from "@/components/SelectorFecha";
import ListaPagosFecha from "@/components/ListaPagosFecha";
import RecalcularImportes from "@/components/RecalcularImportes";

export const dynamic = "force-dynamic";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

function formatEur(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function PagosPorFechaPage({
  searchParams,
}: {
  searchParams: { fecha?: string; todas?: string };
}) {
  const verTodas = searchParams.todas === "1";
  const fecha = searchParams.fecha || hoyISO();

  const pagos = await prisma.pago.findMany({
    where: verTodas ? {} : { fecha: new Date(fecha) },
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
  const totalEur = round2(
    pagos.reduce((sum, p) => sum + (p.importeEur !== null ? Number(p.importeEur) : 0), 0)
  );

  const pagosSimplificados = pagos.map((p) => {
    let etiquetaAsignacion: string | null = null;
    if (p.cobradorAsignadoPor) {
      if (p.cobradorAsignadoPor.rol === "ADMIN") etiquetaAsignacion = "Admin";
      else if (p.cobradorAsignadoPor.cobradorId && p.cobradorAsignadoPor.cobradorId === p.cobradorId)
        etiquetaAsignacion = "Auto";
      else etiquetaAsignacion = p.cobradorAsignadoPor.nombre ? `Por ${p.cobradorAsignadoPor.nombre}` : "Otro";
    }
    return {
      id: p.id,
      fecha: p.fecha.toISOString().slice(0, 10),
      persona: p.persona,
      banco: p.banco,
      contenedorId: p.contenedorId,
      contenedorNombre: p.contenedor?.nombre ?? null,
      cobradorNombre: p.cobrador?.nombre ?? null,
      etiquetaAsignacion,
      importeUsd: p.importeUsd !== null ? Number(p.importeUsd) : null,
      importeEur: p.importeEur !== null ? Number(p.importeEur) : null,
      tasaCambio: p.tasaCambio !== null ? Number(p.tasaCambio) : null,
      fechaTasaCambio: p.fechaTasaCambio ? p.fechaTasaCambio.toISOString().slice(0, 10) : null,
      monedaOriginal: p.monedaOriginal,
    };
  });

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
        <RecalcularImportes />

        <div className="flex items-center justify-between gap-3 mb-2">
          <SelectorFecha fecha={verTodas ? "" : fecha} />
          <div className="text-right">
            <div className="font-mono text-[11px] text-steel uppercase">
              {verTodas ? "Total (todas las fechas)" : "Total ese día"}
            </div>
            <div className="font-mono font-bold text-lg flex items-center gap-2 justify-end">
              <span>{formatUsd(totalUsd)}</span>
              <span className="text-steel">·</span>
              <span>{formatEur(totalEur)}</span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          {verTodas ? (
            <Link href="/dashboard/pagos" className="text-[11.5px] font-mono text-steel underline underline-offset-2">
              Volver a filtrar por fecha
            </Link>
          ) : (
            <Link
              href="/dashboard/pagos?todas=1"
              className="text-[11.5px] font-mono text-navy-800 underline underline-offset-2"
            >
              Ver todas las fechas
            </Link>
          )}
        </div>

        {pagos.length === 0 ? (
          <div className="text-center text-steel text-[13.5px] py-10">
            {verTodas
              ? "No hay ningún pago registrado."
              : `No hay ningún pago registrado el ${new Date(fecha).toLocaleDateString("es-ES")}.`}
          </div>
        ) : (
          <ListaPagosFecha pagos={pagosSimplificados} contenedores={contenedores} cobradores={cobradores} />
        )}
      </main>
    </div>
  );
}
