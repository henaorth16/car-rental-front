"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/types/car";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get("carId");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) {
        throw new Error("Both start date and end date are required");
      }
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error("End date must be after start date");
      }
      const response = await api.post('/api/bookings', {
        carId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      return response.data;
    },
    onSuccess: () => {
      router.push("/bookings");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create booking");
    }
  });

  if (!carId) {
    return <div className="p-8 text-center text-destructive">No car selected for booking. Return to car list and select a car.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !car) {
    return <div className="p-8 text-center text-destructive">Failed to load car details.</div>;
  }

  const images = car.images && car.images.length > 0 ? car.images : [];
  const currentImage = images.length > 0 ? images[0].url : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-xl space-y-8 mt-12 bg-card    border shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-center">Checkout Booking</h1>

      <div className="space-y-6">
        {currentImage ? (
          <div className="flex justify-center mb-6 w-full h-64 bg-muted   overflow-hidden border">
            <img
              src={getImageUrl(currentImage)}
              alt="Car"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex justify-center items-center mb-6 w-full h-64 bg-muted   overflow-hidden border">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Pick-up Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Drop-off Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
            />
          </div>

          {errorMsg && (
            <div className="text-sm text-destructive font-medium">
              {errorMsg}
            </div>
          )}

          <Button
            className="w-full text-lg h-12"
            onClick={() => createBooking()}
            disabled={isPending || !startDate || !endDate}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Book now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}