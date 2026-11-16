"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Booking } from "@/lib/types";
import { useState } from "react";
import { Loader2, Calendar, Car as CarIcon, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FastCheckoutButton from "@/components/ui/FastCheckOutButton";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";


export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery<Booking[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const response = await api.get<{ bookings: Booking[] }>('/api/bookings/my');
      return response.data.bookings || (Array.isArray(response.data) ? response.data : []);
    },
    enabled: !!session?.user,
  });

  const { mutate: cancelBooking } = useMutation({
    mutationFn: async (bookingId: string) => {
      setCancellingId(bookingId);
      const res = await api.delete(`/api/bookings/${bookingId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      setCancellingId(null);
      toast.success("Reservation cancelled successfully");
    },
    onError: (err: any) => {
      setCancellingId(null);
      toast.error(err.response?.data?.error || err.message || "Failed to cancel booking");
    },
  });

  const handleCancelClick = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(bookingId);
    }
  };

  if (isAuthPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Checking session...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-md text-center space-y-6 mt-12 bg-card border rounded-2xl shadow-sm">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
          <CarIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Sign In to View Bookings</h2>
          <p className="text-sm text-muted-foreground">
            Please log in with your account to view and manage your car reservations.
          </p>
        </div>
        <Link href="/login?callbackURL=/bookings" className="block">
          <Button className="w-full h-11">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-destructive mt-12 bg-destructive/10 max-w-2xl border border-destructive/20 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p>Failed to load your bookings. Please try again later.</p>
      </div>
    );
  }

  const bookingList = Array.isArray(bookings) ? bookings : [];

  if (bookingList.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl text-center space-y-6 mt-12 border bg-card    shadow-sm">
        <div className="bg-muted w-24 h-24    flex items-center justify-center mx-auto mt-6 mb-6">
          <CarIcon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No Bookings Yet</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          You haven't made any car reservations yet. Browse our collection and find your perfect ride today!
        </p>
        <Link href="/cars" passHref>
          <Button size="lg" className="mt-4 mb-6">
            Browse Cars
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
      case "PENDING":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "CANCELLED":
        return "bg-rose-500 hover:bg-rose-600 text-white";
      case "COMPLETED":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-2">Manage and view all your car rentals in one place.</p>
        </div>
        <Link href="/cars" passHref>
          <Button variant="outline">Book Another Car</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookingList.map((booking) => {
          const car = booking.car;
          const firstImage = car?.images && car.images.length > 0 ? car.images[0].url : null;
          const days = Math.max(
            1,
            Math.ceil(
              (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          );
          const totalAmount =
            (booking as any).payment?.amount || (car ? car.pricePerDay * days : 0);

          return (
            <Card key={booking.id} className="overflow-hidden pt-0 flex flex-col hover:shadow-md transition-shadow border">
              {firstImage ? (
                <div className="h-48 w-full bg-muted border-b relative">
                  <img src={getImageUrl(firstImage)} alt={car?.model || "Car"} className="w-full h-full object-cover" />
                  <Badge className={`absolute top-4 right-4 shadow-sm border-none ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </Badge>
                </div>
              ) : (
                <div className="h-48 w-full bg-muted border-b flex items-center justify-center relative">
                  <CarIcon className="w-12 h-12 text-muted-foreground/30" />
                  <Badge className={`absolute top-4 right-4 shadow-sm border-none ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl truncate">
                  {car ? `${car.brand} ${car.model}` : 'Deleted Car'}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 font-medium text-primary">
                  {car ? `${car.pricePerDay} ETB / per day` : '-'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 grow border-t pt-4">
                <div className="flex justify-between gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pick-up Date</p>
                      <p className="font-medium text-foreground">{formatDate(booking.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Drop-off Date</p>
                      <p className="font-medium text-foreground">{formatDate(booking.endDate)}</p>
                    </div>
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t text-sm">
                  <span className="text-xs text-muted-foreground">
                    Total ({days} {days === 1 ? "day" : "days"})
                  </span>
                  <span className="font-bold text-base text-foreground">{totalAmount} ETB</span>
                </div>

                {booking.status === "CONFIRMED" && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg font-medium border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Booking confirmed & payment secured</span>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {booking.status === "PENDING" && (
                    <FastCheckoutButton bookingId={booking.id} />
                  )}
                  {booking.status !== "CANCELLED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80"
                      onClick={() => handleCancelClick(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Cancel Reservation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
