import { esFicheroRevolut, procesarRevolut, FilaCruda, PagoDetectado } from "./revolut";

type Parser = {
  banco: string;
  detecta: (headers: string[]) => boolean;
  procesa: (filas: FilaCruda[]) => PagoDetectado[];
};

const PARSERS: Parser[] = [
  { banco: "Revolut", detecta: esFicheroRevolut, procesa: procesarRevolut },
  // Cuando tengamos el formato de Sabadell y Wise, se añaden aquí con su
  // propio archivo parsers/sabadell.ts y parsers/wise.ts
];

export function detectarBanco(headers: string[]): Parser | null {
  return PARSERS.find((p) => p.detecta(headers)) ?? null;
}

export function bancosSoportados(): string[] {
  return PARSERS.map((p) => p.banco);
}
