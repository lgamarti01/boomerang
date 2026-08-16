import Link from "next/link";

export default function TabsCobrador({ activo }: { activo: "pendientes" | "pagos" }) {
  return (
    <div className="flex gap-2 mb-5">
      <Link
        href="/mi/pendientes"
        className={`flex-1 text-center py-2.5 rounded-lg text-[13px] font-semibold ${
          activo === "pendientes" ? "bg-navy-950 text-white" : "bg-white border border-line text-steel"
        }`}
      >
        Pendientes
      </Link>
      <Link
        href="/mi/pagos"
        className={`flex-1 text-center py-2.5 rounded-lg text-[13px] font-semibold ${
          activo === "pagos" ? "bg-navy-950 text-white" : "bg-white border border-line text-steel"
        }`}
      >
        Mis pagos
      </Link>
    </div>
  );
}
