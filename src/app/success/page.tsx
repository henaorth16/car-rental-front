"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Car, History, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10    blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10    blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="max-w-md w-full space-y-12 text-center relative z-10">
        {/* Success Icon Section */}
        <div className="space-y-6">
          <div className="relative flex justify-center scale-110">
            <div className="absolute inset-0 bg-primary/20    blur-2xl animate-pulse scale-150" />
            <div className="bg-primary/10 p-6    relative border border-primary/20 shadow-2xl backdrop-blur-sm">
              <CheckCircle2 className="w-16 h-16 text-primary animate-in zoom-in duration-500" strokeWidth={2.5} />
              <div className="absolute -top-2 -right-2 bg-background border border-border shadow-lg    p-1.5 animate-bounce">
                <Sparkles className="w-5 h-5 text-primary opacity-80" />
              </div>
            </div>
          </div>

          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-serif">
              Payment Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
              Your ride is secured. We've sent a detailed confirmation and digital rental agreement to your inbox.
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-card/50 border-2 border-border/40 shadow-2xl rounded-[2.5rem] p-8 sm:p-10 space-y-6 relative group backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-card/60 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent rounded-[2.5rem] pointer-events-none" />

          <div className="space-y-4">
            <Link href="/bookings" passHref className="block">
              <Button size="lg" className="w-full text-lg h-16    bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all font-bold group/btn active:scale-[0.98]">
                <History className="mr-3 w-6 h-6 opacity-90" />
                View My Bookings
                <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/cars" passHref className="block">
              <Button variant="outline" size="lg" className="w-full text-lg h-16    border-2 border-border/50 hover:bg-secondary/50 text-foreground transition-all font-semibold active:scale-[0.98]">
                <Car className="mr-3 w-6 h-6 opacity-70" />
                Explore More Cars
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-border/30 flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/5    border border-primary/10">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Secure Transaction</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground font-medium">
              <span className="w-2 h-2    bg-primary animate-ping" />
              <span>Redirecting to dashboard in moments...</span>
            </div>
          </div>
        </div>

        {/* Footer Support */}
        <div className="animate-in fade-in duration-1000 delay-500">
          <p className="text-sm text-muted-foreground/80 font-medium">
            Need help with your booking? <Link href="/support" className="text-primary font-bold hover:underline transition-colors">Chat with Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
