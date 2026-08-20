import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ListaPagosFecha from "@/components/ListaPagosFecha";

export const dynamic = "force-dynamic";

export default async function PagosPorFechaPage() {
  const pagos = await prisma.pago.findMany({
    include: { cobrador: true, contenedor: true, cobradorAsignadoPor: true },
    orderBy: { fecha: "desc" },
  });

  const contenedores = await prisma.contenedor.findMany({
    select: { id: true, nombre: true },
    orderBy: { creadoEn: "desc" },
  });

  const cobradores = await prisma.cobrador.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
  });

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
        <div className="font-display font-semibold text-base">Pagos</div>
        <div className="w-10" />
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        {pagos.length === 0 ? (
          <div className="text-center text-steel text-[13.5px] py-10">
            No hay ningún pago registrado todavía.
          </div>
        ) : (
          <ListaPagosFecha pagos={pagosSimplificados} contenedores={contenedores} cobradores={cobradores} />
        )}
      </main>
    </div>
  );
}
