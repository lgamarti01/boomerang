import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { cobradorId } = await req.json();
  if (!cobradorId) {
    return NextResponse.json({ error: "Falta cobradorId" }, { status: 400 });
  }

  const pago = await prisma.pago.update({
    where: { id: params.id },
    data: { cobradorId },
    include: { cobrador: true },
  });

  return NextResponse.json({ pago });
}
