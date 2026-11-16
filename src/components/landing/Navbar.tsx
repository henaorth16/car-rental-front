"use client";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/cars" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const pathName = usePathname();
  const role = String(
    (session as any)?.session?.custom?.role ?? "USER",
  ).toUpperCase();
  const accountHref =
    role === "ADMIN"
      ? "/admin"
      : role === "AGENT"
        ? "/management"
        : "/profile";

  useEffect(() => {
    const handleScroll = () => {
      // Transition after scrolling half of the viewport height
      setScrolled(window.scrollY > window.innerHeight / 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      setProfileDialogOpen(false);
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav
      className={cn(
        `${pathName === "/" ? "fixed" : "relative"} top-0 left-0 right-0 z-50 transition-all duration-300`,
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/40 py-3 shadow-sm"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a
          href="#"
          className="text-xl font-bold font-display tracking-tight text-[#4e33a8]"
        >
          HASHIRI
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                `font-medium hover:text-muted-foreground transition-colors text-foreground`,
                pathName == "/" && !scrolled ? "text-white" : "",
                pathName === link.href ? "text-primary" : "",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle notScrolled={pathName == "/" && !scrolled} />
          {session ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 border border-border/20"
              onClick={() => setProfileDialogOpen(true)}
            >
              <User
                size={20}
                className={cn(
                  "text-foreground",
                  pathName == "/" && !scrolled ? "text-white" : "",
                )}
              />
            </Button>
          ) : (
            <Link href="/login">
              <Button size="sm" className="px-6">
                Log in
              </Button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X size={24} />
          ) : (
            <Menu
              className={cn(
                "text-foreground",
                pathName == "/" && !scrolled ? "text-white" : "",
              )}
              size={24}
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card bg-background/95 border-t border-border/20 overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2">
                <ModeToggle notScrolled={false} />
                {session ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      setProfileDialogOpen(true);
                    }}
                    className="flex items-center gap-2 text-foreground font-medium"
                  >
                    <User size={20} /> Account
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-fit px-6">
                      Log in
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileDialogOpen && session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setProfileDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Account and role information
                  </p>
                </div>
                <button
                  onClick={() => setProfileDialogOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close profile dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{session.user.name ?? "N/A"}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">
                    {session.user.email ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">
                    {role || "USER"}
                  </p>
                </div>
              </div>

              {logoutError ? (
                <p className="mt-4 text-sm text-red-500">{logoutError}</p>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-3">
                {role === "USER" ? (
                  <Link
                    href="/management/apply"
                    onClick={() => setProfileDialogOpen(false)}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    Become agent
                  </Link>
                ) : (
                  <Link
                    href={accountHref}
                    onClick={() => setProfileDialogOpen(false)}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    Open dashboard
                  </Link>
                )}
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
