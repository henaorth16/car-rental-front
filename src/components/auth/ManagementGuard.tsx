"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ManagementGuardProps = {
  children: React.ReactNode;
  allowAdminOnly?: boolean;
};

export default function ManagementGuard({
  children,
  allowAdminOnly = false,
}: ManagementGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const role = String(
    (session as { session?: { custom?: { role?: string } }; custom?: { role?: string }; user?: { role?: string } } | undefined)
      ?.session?.custom?.role ??
      (session as { custom?: { role?: string } } | undefined)?.custom?.role ??
      (session as { user?: { role?: string } } | undefined)?.user?.role ??
      "",
  ).toUpperCase();
  const isAgentOrAdmin = role === "AGENT" || role === "ADMIN";
  const hasAccess = allowAdminOnly ? role === "ADMIN" : isAgentOrAdmin;

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/management/login");
      return;
    }
    if (!hasAccess) {
      router.replace("/cars");
    }
  }, [hasAccess, isPending, router, session?.user]);

  if (isPending || !session?.user || !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
