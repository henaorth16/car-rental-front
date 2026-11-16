"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const managementLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Vehicles", href: "/admin/cars" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Team", href: "/admin/users" },
];

export function ManagementNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/admin" className="text-lg font-semibold tracking-tight text-primary">
          HASHIRI MANAGEMENT
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {managementLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(link.href) ? "text-foreground" : "",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Profile
          </Link>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
