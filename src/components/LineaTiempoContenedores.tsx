type Duracion = {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaCompletado: string | null;
  dias: number;
  enCurso: boolean;
  pct: number;
};

export default function LineaTiempoContenedores({ duraciones }: { duraciones: Duracion[] }) {
  if (duraciones.length === 0) {
    return <div className="text-center text-steel text-[13.5px] py-6">Todavía no hay contenedores.</div>;
  }

  const maxDias = Math.max(...duraciones.map((d) => d.dias), 1);

  return (
    <div>
      {duraciones.map((d) => (
        <div key={d.id} className="bg-white border border-line rounded-xl p-3.5 mb-2.5">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-[14px]">{d.nombre}</div>
            <span
              className={`font-mono text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
                d.enCurso ? "bg-amber/10 text-amber-ink" : "bg-teal-bg text-[#0F5D45]"
              }`}
            >
              {d.enCurso ? "En curso" : "Completado"}
            </span>
          </div>
          <div className="h-2 bg-[#EEF1F5] rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-gradient-to-r from-amber to-[#3FC79A]"
              style={{ width: `${Math.max((d.dias / maxDias) * 100, 4)}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-steel">
            <span>
              {new Date(d.fechaInicio).toLocaleDateString("es-ES")}
              {d.fechaCompletado ? ` → ${new Date(d.fechaCompletado).toLocaleDateString("es-ES")}` : " → hoy"}
            </span>
            <span>
              {d.dias} día(s){d.enCurso ? ` · ${d.pct}%` : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
