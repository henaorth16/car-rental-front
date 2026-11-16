"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  CheckCircle2,
  ArrowRight,
  Car,
  History,
  Sparkles,
  ShieldCheck,
  Calendar,
  Loader2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [confirmedData, setConfirmedData] = useState<any>(null);

  const { mutate: confirmPayment, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post("/api/payments/confirm", { bookingId: id });
      return data;
    },
    onSuccess: (data) => {
      setConfirmedData(data.booking);
      toast.success("Payment verified! Booking confirmed.");
    },
    onError: (err) => {
      console.warn("Payment auto-confirmation notice:", err);
    },
  });

  useEffect(() => {
    if (bookingId) {
      confirmPayment(bookingId);
    }
  }, [bookingId, confirmPayment]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="max-w-lg w-full space-y-8 text-center relative z-10">
        {/* Success Icon */}
        <div className="space-y-4">
          <div className="relative flex justify-center scale-110">
            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse scale-150" />
            <div className="bg-primary/10 p-5 relative border border-primary/20 shadow-2xl backdrop-blur-sm rounded-2xl">
              <CheckCircle2 className="w-14 h-14 text-primary animate-in zoom-in duration-500" strokeWidth={2.5} />
              <div className="absolute -top-2 -right-2 bg-background border border-border shadow-md rounded-full p-1.5 animate-bounce">
                <Sparkles className="w-4 h-4 text-primary opacity-80" />
              </div>
            </div>
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-serif">
              Payment Confirmed!
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
              Your car reservation is officially confirmed and secured in the system.
            </p>
          </div>
        </div>

        {/* Dynamic Booking Confirmation Card */}
        {isPending ? (
          <div className="p-8 bg-card/60 border rounded-2xl flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Finalizing reservation and payment...</p>
          </div>
        ) : confirmedData ? (
          <div className="p-6 bg-card/80 border rounded-2xl shadow-sm text-left space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reserved Vehicle</p>
                <h3 className="text-lg font-bold">
                  {confirmedData.car?.brand} {confirmedData.car?.model}
                </h3>
              </div>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">CONFIRMED</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Pick-up
                </span>
                <p className="font-semibold">{new Date(confirmedData.startDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Drop-off
                </span>
                <p className="font-semibold">{new Date(confirmedData.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            {confirmedData.payment && (
              <div className="pt-2 border-t flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-extrabold text-foreground">{confirmedData.payment.amount} ETB</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="bg-card/50 border border-border/40 shadow-xl rounded-2xl p-6 sm:p-8 space-y-4 backdrop-blur-md">
          <div className="space-y-3">
            <Link href="/bookings" passHref className="block">
              <Button size="lg" className="w-full text-base h-13 font-bold group shadow-md">
                <History className="mr-2 w-5 h-5 opacity-90" />
                View My Bookings
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/cars" passHref className="block">
              <Button variant="outline" size="lg" className="w-full text-base h-13 font-semibold">
                <Car className="mr-2 w-5 h-5 opacity-70" />
                Browse Fleet
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-border/30 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Payment
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-primary" /> Instant Agreement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
