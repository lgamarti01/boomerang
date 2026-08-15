"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-[11px] font-mono text-steel-light hover:text-white transition-colors"
    >
      Salir
    </button>
  );
}
