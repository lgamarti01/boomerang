import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectarBanco, bancosSoportados } from "@/lib/importers";
import Papa from "papaparse";
import * as XLSX from "xlsx";

function fechaISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const usuarioId = (session.user as any).id as string;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se ha recibido ningún fichero" }, { status: 400 });
  }

  const nombreFichero = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  let filas: Record<string, any>[] = [];
  try {
    if (nombreFichero.endsWith(".csv")) {
      const texto = buffer.toString("utf-8");
      const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
      filas = parsed.data as Record<string, any>[];
    } else if (nombreFichero.endsWith(".xlsx") || nombreFichero.endsWith(".xls")) {
      const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
      const hoja = wb.Sheets[wb.SheetNames[0]];
      filas = XLSX.utils.sheet_to_json(hoja, { defval: "" });
      filas = filas.map((f) => {
        const copia = { ...f };
        for (const k of Object.keys(copia)) {
          if (copia[k] instanceof Date) {
            copia[k] = copia[k].toISOString().slice(0, 10);
          }
        }
        return copia;
      });
    } else {
      return NextResponse.json(
        { error: "Formato de fichero no soportado. Sube un .csv o .xlsx" },
        { status: 400 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "No se ha podido leer el fichero. ¿Seguro que es un CSV o Excel válido?" },
      { status: 400 }
    );
  }

  if (filas.length === 0) {
    return NextResponse.json({ error: "El fichero está vacío" }, { status: 400 });
  }

  const headers = Object.keys(filas[0]);
  const parser = detectarBanco(headers);
  if (!parser) {
    return NextResponse.json(
      {
        error: `No se reconoce el formato de este fichero. Bancos soportados de momento: ${bancosSoportados().join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const contenedor = await prisma.contenedor.findFirst({ where: { estado: "ACTIVO" } });
  if (!contenedor) {
    return NextResponse.json({ error: "No hay ningún contenedor activo al que asignar los pagos" }, { status: 400 });
  }

  const detectados = parser.procesa(filas);

  if (detectados.length === 0) {
    return NextResponse.json({
      banco: parser.banco,
      contenedor: contenedor.nombre,
      totalFichero: filas.length,
      nuevos: 0,
      duplicados: 0,
      anterioresAlUltimo: 0,
      sinTasa: 0,
      pagosNuevos: [],
    });
  }

  // Salvaguarda clave: nunca importamos pagos con fecha igual o anterior al
  // último pago ya registrado en BBDD para este banco. Esto evita que, si se
  // sube por error un fichero con un rango de fechas más amplio del que toca,
  // se cuelen pagos históricos que en realidad pertenecen a otro contenedor.
  const ultimoPago = await prisma.pago.aggregate({
    where: { banco: parser.banco },
    _max: { fecha: true },
  });
  const fechaCorte = ultimoPago._max.fecha ? fechaISO(ultimoPago._max.fecha) : null;

  const dentroDeRango = fechaCorte ? detectados.filter((d) => d.fecha > fechaCorte) : detectados;
  const anterioresAlUltimo = detectados.length - dentroDeRango.length;

  const idsExistentes = new Set(
    (
      await prisma.pago.findMany({
        where: { idOrigen: { in: dentroDeRango.map((d) => d.idOrigen) } },
        select: { idOrigen: true },
      })
    ).map((p) => p.idOrigen)
  );

  const nuevos = dentroDeRango.filter((d) => !idsExistentes.has(d.idOrigen));
  const duplicados = dentroDeRango.length - nuevos.length;

  const fechasUnicas = Array.from(new Set(nuevos.map((n) => n.fecha)));
  const tasas = await prisma.tipoCambioDia.findMany({
    where: { fecha: { in: fechasUnicas.map((f) => new Date(f)) } },
  });
  const tasaPorFecha = new Map(tasas.map((t) => [fechaISO(t.fecha), Number(t.usdPorEur)]));

  let sinTasa = 0;
  const pagosNuevos: any[] = [];

  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  for (const d of nuevos) {
    const tasa = tasaPorFecha.get(d.fecha) ?? null;
    const importeOriginal = round2(d.importe);
    let importeEur: number | null = null;
    let importeUsd: number | null = null;

    if (d.moneda === "EUR") {
      importeEur = importeOriginal;
      importeUsd = tasa !== null ? round2(importeOriginal * tasa) : null;
    } else if (d.moneda === "USD") {
      importeUsd = importeOriginal;
      importeEur = tasa !== null ? round2(importeOriginal / tasa) : null;
    }
    if (tasa === null) sinTasa++;

    pagosNuevos.push({
      contenedorId: contenedor.id,
      fecha: new Date(d.fecha),
      persona: d.persona,
      importeEur,
      importeUsd,
      tasaCambio: tasa,
      banco: d.banco,
      idOrigen: d.idOrigen,
      creadoPorId: usuarioId,
      actualizadoPorId: usuarioId,
    });
  }

  if (pagosNuevos.length > 0) {
    await prisma.pago.createMany({ data: pagosNuevos, skipDuplicates: true });
  }

  return NextResponse.json({
    banco: parser.banco,
    contenedor: contenedor.nombre,
    totalFichero: filas.length,
    nuevos: pagosNuevos.length,
    duplicados,
    anterioresAlUltimo,
    sinTasa,
    pagosNuevos: pagosNuevos.map((p) => ({
      persona: p.persona,
      fecha: fechaISO(p.fecha),
      importeEur: p.importeEur,
      importeUsd: p.importeUsd,
    })),
  });
}
