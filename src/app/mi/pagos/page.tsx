import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";
import MisPagosLista from "@/components/MisPagosLista";
import FiltroFecha from "@/components/FiltroFecha";
import TabsCobrador from "@/components/TabsCobrador";

export const dynamic = "force-dynamic";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatUsd(n: number) {
  return round2(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

export default async function MisPagosPage({
  searchParams,
}: {
  searchParams: { fecha?: string };
}) {
  const session = await getServerSession(authOptions);
  const cobradorId = (session?.user as any)?.cobradorId as string | null;
  const nombre = session?.user?.name ?? "";
  const fecha = searchParams.fecha;

  if (!cobradorId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="font-display text-lg mb-2">Tu usuario no está vinculado a ningún cobrador</p>
          <p className="text-steel text-sm">Pide al administrador que lo configure.</p>
        </div>
      </div>
    );
  }

  const misPagos = await prisma.pago.findMany({
    where: { cobradorId, ...(fecha ? { fecha: new Date(fecha) } : {}) },
    include: { contenedor: true },
    orderBy: { fecha: "desc" },
  });

  const totalMio = round2(
    misPagos.reduce((sum, p) => sum + (p.importeUsd !== null ? Number(p.importeUsd) : 0), 0)
  );

  const pagos = misPagos.map((p) => ({
    id: p.id,
    persona: p.persona,
    fechaStr: p.fecha.toLocaleDateString("es-ES"),
    banco: p.banco,
    contenedorId: p.contenedorId ?? "sin-contenedor",
    contenedorNombre: p.contenedor?.nombre ?? "Sin contenedor",
    importeUsd: p.importeUsd !== null ? Number(p.importeUsd) : null,
    importeEur: p.importeEur !== null ? Number(p.importeEur) : null,
  }));

  return (
    <div className="min-h-screen">
      <div className="bg-navy-950 text-white px-4.5 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="font-display font-semibold text-base flex items-center gap-2">
          <span className="w-2 h-2 bg-amber rounded-sm" /> BOOMERANG
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] text-steel-light">{nombre}</div>
          <SignOutButton />
        </div>
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-5">
          <div className="font-mono text-[11px] uppercase text-steel mb-1.5">Hola, {nombre}</div>
          <h2 className="font-display text-[22px] font-semibold">Mis pagos</h2>
        </div>

        <TabsCobrador activo="pagos" />

        <div className="bg-gradient-to-br from-navy-950 to-navy-800 text-white rounded-2xl p-5 mb-5">
          <div className="font-mono text-[11px] text-steel-light mb-0.5">
            TOTAL COBRADO{fecha ? ` · ${new Date(fecha).toLocaleDateString("es-ES")}` : ""}
          </div>
          <div className="font-mono text-[26px] font-semibold">{formatUsd(totalMio)}</div>
          <div className="font-mono text-[11.5px] text-steel-light mt-1">
            {misPagos.length} pago(s) asignados
          </div>
        </div>

        <div className="mb-4">
          <FiltroFecha basePath="/mi/pagos" fecha={fecha} />
        </div>

        <MisPagosLista pagos={pagos} />
      </main>
    </div>
  );
}
