"use client";

import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/landing/Navbar";
import { ManagementNavbar } from "@/components/landing/ManagementNavbar";

export function AppNavbar() {
  const { data: session } = authClient.useSession();
  const role = String(
    (session as { session?: { custom?: { role?: string } }; custom?: { role?: string }; user?: { role?: string } } | undefined)
      ?.session?.custom?.role ??
      (session as { custom?: { role?: string } } | undefined)?.custom?.role ??
      (session as { user?: { role?: string } } | undefined)?.user?.role ??
      "USER",
  ).toUpperCase();
  const isManagementRole = role === "ADMIN" || role === "AGENT";

  if (isManagementRole) {
    return <ManagementNavbar />;
  }

  return <Navbar />;
}
