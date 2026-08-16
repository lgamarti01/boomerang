// Reconoce y procesa el fichero de tipos de cambio históricos del Banco de
// España. Es un formato muy distinto al de los bancos (no es una tabla de
// movimientos, sino una serie de datos con varias filas de metadatos antes
// de empezar la tabla de fechas/valores).

export type TasaDetectada = {
  fecha: string; // YYYY-MM-DD
  usdPorEur: number;
};

const MESES: Record<string, string> = {
  ENE: "01", FEB: "02", MAR: "03", ABR: "04", MAY: "05", JUN: "06",
  JUL: "07", AGO: "08", SEP: "09", OCT: "10", NOV: "11", DIC: "12",
};

export function esFicheroTipoCambioBDE(grid: any[][]): boolean {
  const cabecera = String(grid[0]?.[0] ?? "").trim().toUpperCase();
  const serieCol1 = String(grid[0]?.[1] ?? "");
  const descripcion = String(grid[3]?.[1] ?? "").toUpperCase();
  return cabecera.includes("CÓDIGO DE LA SERIE") && (serieCol1.includes("USDEUR") || descripcion.includes("USD/EUR"));
}

export function procesarTipoCambioBDE(grid: any[][]): TasaDetectada[] {
  const resultado: TasaDetectada[] = [];
  const FECHA_MINIMA = "2026-01-01"; // solo cargamos tasas a partir de esta fecha

  for (const fila of grid) {
    const raw = String(fila?.[0] ?? "").trim();
    const m = raw.match(/^(\d{2})\s+([A-ZÑ]{3})\s+(\d{4})$/i);
    if (!m) continue;

    const [, dia, mesTxt, anio] = m;
    const mes = MESES[mesTxt.toUpperCase()];
    if (!mes) continue;

    const fecha = `${anio}-${mes}-${dia}`;
    if (fecha < FECHA_MINIMA) continue;

    const valorRaw = String(fila?.[1] ?? "").trim();
    if (!valorRaw || valorRaw === "-") continue;

    const valor = parseFloat(valorRaw.replace(",", "."));
    if (!valor || isNaN(valor)) continue;

    resultado.push({ fecha, usdPorEur: valor });
  }

  return resultado;
}
