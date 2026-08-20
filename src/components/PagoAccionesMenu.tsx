"use client";

import { useState } from "react";
import ReasignarContenedor from "@/components/ReasignarContenedor";
import EditarPago from "@/components/EditarPago";

type Props = {
  pagoId: string;
  contenedorId: string | null;
  contenedores: { id: string; nombre: string }[];
  fecha: string;
  persona: string;
  importeOriginal: number | null;
  monedaOriginal: string;
};

export default function PagoAccionesMenu({
  pagoId,
  contenedorId,
  contenedores,
  fecha,
  persona,
  importeOriginal,
  monedaOriginal,
}: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-6 h-6 flex items-center justify-center text-steel"
        aria-label="Más acciones"
      >
        ⋮
      </button>

      {abierto && (
        <div className="absolute right-0 top-7 z-10 w-64 bg-white border border-line rounded-lg shadow-lg p-3">
          <div className="mb-3">
            <div className="text-[10.5px] font-mono uppercase text-steel mb-1.5">Contenedor</div>
            <ReasignarContenedor pagoId={pagoId} contenedorId={contenedorId} contenedores={contenedores} />
          </div>
          <div className="border-t border-line pt-2.5">
            <EditarPago
              pagoId={pagoId}
              fecha={fecha}
              persona={persona}
              importeOriginal={importeOriginal}
              monedaOriginal={monedaOriginal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
