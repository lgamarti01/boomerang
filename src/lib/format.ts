export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatNumeroEs(n: number): string {
  const partes = round2(n).toFixed(2).split(".");
  const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${entero},${partes[1]}`;
}

export function formatUsd(n: number): string {
  return formatNumeroEs(n) + " $";
}

export function formatEur(n: number): string {
  return formatNumeroEs(n) + " €";
}
