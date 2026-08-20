import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { obtenerTotalesDiarios } from "@/lib/estadisticasQuery";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const datos = await obtenerTotalesDiarios({
    contenedorId: searchParams.get("contenedorId") || "",
    rango: (searchParams.get("rango") as "30" | "todo") || "30",
  });

  return NextResponse.json({ datos });
}
