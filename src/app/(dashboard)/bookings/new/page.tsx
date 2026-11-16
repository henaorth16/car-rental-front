"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/types/car";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Loader2,
  Calendar,
  Car as CarIcon,
  ChevronLeft,
  Fuel,
  Settings2,
  Users,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get("carId");
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    data: car,
    isLoading,
    error,
  } = useQuery<Car>({
    queryKey: ["cars", carId],
    queryFn: async () => {
      if (!carId) throw new Error("No car ID provided");
      const { data } = await api.get<{ car: Car }>(`/api/cars/${carId}`);
      return data.car;
    },
    enabled: !!carId,
  });

  // Calculate rental duration in days (minimum 1 day)
  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    if (!car || days <= 0) return 0;
    return car.pricePerDay * days;
  }, [car, days]);

  const { mutate: createBooking, isPending: isBookingPending } = useMutation({
    mutationFn: async () => {
      setErrorMsg("");
      if (!startDate || !endDate) {
        throw new Error("Both start date and drop-off date are required.");
      }
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error("Drop-off date must be after pick-up date.");
      }
      const response = await api.post("/api/bookings", {
        carId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Reservation initiated! Complete payment to confirm.");
      router.push("/bookings");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create reservation. Please check vehicle availability.";
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  if (!carId) {
    return (
      <div className="container mx-auto py-16 px-4 text-center max-w-md space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <CarIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No Car Selected</h2>
        <p className="text-muted-foreground text-sm">
          Please select a vehicle from our fleet catalog to proceed with your booking.
        </p>
        <Link href="/cars">
          <Button className="mt-2">Browse Fleet</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || isAuthPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto py-12 px-4 text-center max-w-lg space-y-4">
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h2 className="text-lg font-bold">Vehicle Unavailable</h2>
          <p className="text-sm">We could not load the requested vehicle details or it no longer exists.</p>
        </div>
        <Link href="/cars">
          <Button variant="outline">Back to Fleet</Button>
        </Link>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [];
  const currentImage = images.length > 0 ? images[0].url : null;

  // Handle unauthenticated state
  if (!session?.user) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-md space-y-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Sign In Required</h2>
          <p className="text-sm text-muted-foreground">
            Please log in or create an account to book the {car.brand} {car.model}.
          </p>
        </div>
        <Link href={`/login?callbackURL=/bookings/new?carId=${car.id}`} className="block">
          <Button className="w-full h-12 text-base">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      {/* Back button */}
      <Link
        href={`/cars/${car.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to {car.brand} {car.model}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vehicle Summary */}
        <div className="md:col-span-5 space-y-6">
          <Card className="overflow-hidden border shadow-sm">
            <div className="w-full h-52 bg-muted relative overflow-hidden flex items-center justify-center">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CarIcon className="w-16 h-16 text-muted-foreground/30" />
              )}
              <Badge className="absolute top-3 right-3 shadow-xs">
                {car.available ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">{car.type}</p>
                <h2 className="text-2xl font-bold text-foreground">
                  {car.brand} {car.model}
                </h2>
              </div>

              {/* Specs Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                {car.transmission && (
                  <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md font-medium capitalize">
                    <Settings2 className="w-3.5 h-3.5 text-primary" />
                    {car.transmission.toLowerCase()}
                  </span>
                )}
                {car.fuelType && (
                  <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md font-medium capitalize">
                    <Fuel className="w-3.5 h-3.5 text-primary" />
                    {car.fuelType.toLowerCase()}
                  </span>
                )}
                {car.seats && (
                  <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md font-medium">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {car.seats} seats
                  </span>
                )}
              </div>

              <div className="pt-3 border-t flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Daily Rate</span>
                <span className="text-xl font-extrabold text-foreground">{car.pricePerDay} ETB / day</span>
              </div>
            </CardContent>
          </Card>

          {/* Guarantee Perks */}
          <div className="p-4 rounded-xl border bg-card/60 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Rental Protection & Policy</span>
            </div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Free cancellation on pending bookings</li>
              <li>Collision damage & liability covered</li>
              <li>24/7 Roadside assistance included</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Date Selection & Cost Breakdown */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Reserve Vehicle</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select your trip dates to calculate rental cost and secure this car.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Pick-up Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartDate(newStart);
                      if (newStart && (!endDate || new Date(endDate) <= new Date(newStart))) {
                        const nextDay = new Date(new Date(newStart).getTime() + 86400000)
                          .toISOString()
                          .split("T")[0];
                        setEndDate(nextDay);
                      }
                    }}
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Drop-off Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split("T")[0] : todayStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Price Calculation Summary */}
              {days > 0 ? (
                <div className="p-4 rounded-xl bg-muted/40 border space-y-2.5 text-sm animate-in fade-in duration-200">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>
                      {car.pricePerDay} ETB × {days} {days === 1 ? "day" : "days"}
                    </span>
                    <span className="font-medium text-foreground">{totalPrice} ETB</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground text-xs">
                    <span>Security Deposit</span>
                    <span className="text-emerald-600 font-medium">Refundable at drop-off</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground text-xs">
                    <span>Cleaning & Maintenance</span>
                    <span className="text-emerald-600 font-medium">Included</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-baseline font-bold text-base text-foreground">
                    <span>Total Estimated Amount</span>
                    <span className="text-2xl font-black text-primary">{totalPrice} ETB</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/20 border border-dashed text-center text-xs text-muted-foreground">
                  Select valid pick-up and drop-off dates to view price calculation.
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                size="lg"
                className="w-full text-base h-13 shadow-md"
                onClick={() => createBooking()}
                disabled={isBookingPending || days <= 0 || !car.available}
              >
                {isBookingPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Confirming Reservation...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reserve Car • {totalPrice > 0 ? `${totalPrice} ETB` : "Select Dates"}
                  </>
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                You will be able to review your reservation and proceed to checkout on the bookings dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
