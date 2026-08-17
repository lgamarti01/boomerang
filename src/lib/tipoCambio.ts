import { prisma } from "@/lib/prisma";

export type TasaOrdenada = { fecha: string; valor: number };
export type TasaEncontrada = { valor: number; fechaTasa: string } | null;

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function fechaISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function obtenerTasasOrdenadas(): Promise<TasaOrdenada[]> {
  const filas = await prisma.tipoCambioDia.findMany({ orderBy: { fecha: "asc" } });
  return filas.map((f) => ({ fecha: fechaISO(f.fecha), valor: Number(f.usdPorEur) }));
}

export function buscarTasaConFecha(tasasOrdenadas: TasaOrdenada[], fecha: string): TasaEncontrada {
  const exacta = tasasOrdenadas.find((t) => t.fecha === fecha);
  if (exacta) return { valor: exacta.valor, fechaTasa: exacta.fecha };

  const anteriores = tasasOrdenadas.filter((t) => t.fecha < fecha);
  if (anteriores.length === 0) return null;

  const masCercana = anteriores[anteriores.length - 1];
  return { valor: masCercana.valor, fechaTasa: masCercana.fecha };
}

export async function recalcularPagosConTasaMejorable(usuarioId: string): Promise<number> {
  const tasasOrdenadas = await obtenerTasasOrdenadas();
  if (tasasOrdenadas.length === 0) return 0;

  const todosPagos = await prisma.pago.findMany();
  let actualizados = 0;

  for (const pago of todosPagos) {
    const fechaPago = fechaISO(pago.fecha);
    const fechaTasaActual = pago.fechaTasaCambio ? fechaISO(pago.fechaTasaCambio) : null;

    if (fechaTasaActual === fechaPago) continue;

    const encontrada = buscarTasaConFecha(tasasOrdenadas, fechaPago);
    if (!encontrada) continue;

    if (fechaTasaActual === encontrada.fechaTasa) continue;

    const data: Record<string, any> = {
      tasaCambio: encontrada.valor,
      fechaTasaCambio: new Date(encontrada.fechaTasa),
      actualizadoPorId: usuarioId,
    };

    if (pago.monedaOriginal === "USD") {
      data.importeEur = round2(Number(pago.importeUsd) / encontrada.valor);
    } else {
      data.importeUsd = round2(Number(pago.importeEur) * encontrada.valor);
    }

    await prisma.pago.update({ where: { id: pago.id }, data });
    actualizados++;
  }

  return actualizados;
}
