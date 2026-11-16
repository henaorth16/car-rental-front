"use client";

import ManagementGuard from "@/components/auth/ManagementGuard";

export default function AdminLayOut({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagementGuard>
      <section>{children}</section>
    </ManagementGuard>
  );
}
