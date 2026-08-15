import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { cobradorId, contenedorId } = await req.json();
  if (!cobradorId && !contenedorId) {
    return NextResponse.json({ error: "Falta cobradorId o contenedorId" }, { status: 400 });
  }

  const data: Record<string, string> = { actualizadoPorId: (session.user as any).id };
  if (cobradorId) data.cobradorId = cobradorId;
  if (contenedorId) data.contenedorId = contenedorId;

  const pago = await prisma.pago.update({
    where: { id: params.id },
    data,
    include: { cobrador: true, contenedor: true },
  });

  return NextResponse.json({ pago });
}
