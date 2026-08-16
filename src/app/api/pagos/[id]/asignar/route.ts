import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const usuarioId = (session.user as any).id as string;
  const rol = (session.user as any).rol as string;
  const miCobradorId = (session.user as any).cobradorId as string | null;

  const { cobradorId, contenedorId } = await req.json();
  if (!cobradorId && !contenedorId) {
    return NextResponse.json({ error: "Falta cobradorId o contenedorId" }, { status: 400 });
  }

  if (rol !== "ADMIN") {
    if (contenedorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (!cobradorId || cobradorId !== miCobradorId) {
      return NextResponse.json({ error: "Solo puedes asignarte pagos a ti mismo" }, { status: 403 });
    }
  }

  const data: Record<string, any> = { actualizadoPorId: usuarioId };
  if (cobradorId) {
    data.cobradorId = cobradorId;
    data.cobradorAsignadoPorId = usuarioId;
    data.cobradorAsignadoEn = new Date();
  }
  if (contenedorId) data.contenedorId = contenedorId;

  const pago = await prisma.pago.update({
    where: { id: params.id },
    data,
    include: { cobrador: true, contenedor: true },
  });

  return NextResponse.json({ pago });
}
