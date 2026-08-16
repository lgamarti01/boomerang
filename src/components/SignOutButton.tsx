"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-[11px] font-mono text-steel-light hover:text-white transition-colors"
    >
      Salir
    </button>
  );
}
