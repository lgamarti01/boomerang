import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const contenedor = await prisma.contenedor.findUnique({
    where: { id: params.id },
    include: {
      pagos: {
        include: { cobrador: true, cobradorAsignadoPor: true },
        orderBy: [{ fecha: "asc" }, { persona: "asc" }],
      },
    },
  });

  if (!contenedor) {
    return NextResponse.json({ error: "Contenedor no encontrado" }, { status: 404 });
  }

  const saldoInicial = Number(contenedor.saldoInicial);
  const totalFactura = Number(contenedor.totalFactura);
  const pagosConImporte = contenedor.pagos.filter((p) => p.importeUsd !== null);
  const recibido = round2(
    saldoInicial + pagosConImporte.reduce((sum, p) => sum + Number(p.importeUsd), 0)
  );
  const falta = round2(Math.max(totalFactura - recibido, 0));

  const resumen = [
    ["Contenedor", contenedor.nombre],
    ["Código", contenedor.codigo ?? "sin código"],
    ["Estado", contenedor.estado],
    ["Fecha de inicio", contenedor.fechaInicio.toLocaleDateString("es-ES")],
    ["Saldo inicial", saldoInicial, contenedor.monedaSaldoInicial],
    ["Total factura", totalFactura, contenedor.monedaTotalFactura],
    ["Recibido (USD)", recibido],
    ["Falta por cobrar (USD)", falta],
    ["Número de pagos", contenedor.pagos.length],
    ["Exportado el", new Date().toLocaleString("es-ES")],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen["!cols"] = [{ wch: 24 }, { wch: 22 }, { wch: 10 }];

  const cabecera = [
    "Fecha",
    "Persona",
    "Banco",
    "Importe EUR",
    "Importe USD",
    "Tasa de cambio",
    "Fecha de la tasa",
    "Moneda original",
    "Cobrador",
    "Asignado por",
    "Fecha de asignación",
  ];

  const filas = contenedor.pagos.map((p) => {
    let asignadoPor = "";
    if (p.cobradorAsignadoPor) {
      if (p.cobradorAsignadoPor.rol === "ADMIN") asignadoPor = "Admin";
      else if (p.cobradorAsignadoPor.cobradorId === p.cobradorId) asignadoPor = "Autoasignado";
      else asignadoPor = `Por ${p.cobradorAsignadoPor.nombre ?? "otro cobrador"}`;
    }
    return [
      p.fecha.toLocaleDateString("es-ES"),
      p.persona,
      p.banco,
      p.importeEur !== null ? Number(p.importeEur) : "",
      p.importeUsd !== null ? Number(p.importeUsd) : "",
      p.tasaCambio !== null ? Number(p.tasaCambio) : "",
      p.fechaTasaCambio ? p.fechaTasaCambio.toLocaleDateString("es-ES") : "",
      p.monedaOriginal,
      p.cobrador?.nombre ?? "sin asignar",
      asignadoPor,
      p.cobradorAsignadoEn ? p.cobradorAsignadoEn.toLocaleDateString("es-ES") : "",
    ];
  });

  const wsPagos = XLSX.utils.aoa_to_sheet([cabecera, ...filas]);
  wsPagos["!cols"] = [
    { wch: 11 }, { wch: 28 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsPagos, "Pagos");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const nombreFichero = `${contenedor.nombre.replace(/[^a-zA-Z0-9]+/g, "_")}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombreFichero}"`,
    },
  });
}
