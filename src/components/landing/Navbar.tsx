"use client"
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const { data: session } = authClient.useSession();

  const pathName = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      // Transition after scrolling half of the viewport height
      setScrolled(window.scrollY > window.innerHeight / 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        `${pathName === "/" ? "fixed" : "relative"} top-0 left-0 right-0 z-50 transition-all duration-300`,
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/40 py-3 shadow-sm"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="text-xl font-bold font-display tracking-tight text-[#4e33a8]">
          HASHIRI
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(`font-medium hover:text-muted-foreground transition-colors text-foreground`, pathName == "/" && !scrolled ? "text-white" : "", pathName === link.href ? "text-primary" : "")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle notScrolled={pathName == "/" && !scrolled} />
          {session ? (
            <Link href="/profile">
              <Button size="icon" variant="ghost" className="   h-10 w-10 border border-border/20">
                <User size={20} className={cn("text-foreground", pathName == "/" && !scrolled ? "text-white" : "")} />
              </Button>
            </Link>
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
          {open ? <X size={24} /> : <Menu className={cn("text-foreground", pathName == "/" && !scrolled ? "text-white" : "")} size={24} />}
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
                <ModeToggle notScrolled={false}/>
                {session ? (
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <User size={20} /> Account
                    </div>
                  </Link>
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
    </nav>
  );
}
