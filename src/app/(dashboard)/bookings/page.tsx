"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Booking } from "@/lib/types";
import { Loader2, Calendar, Car as CarIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FastCheckoutButton from "@/components/ui/FastCheckOutButton";


export default function BookingsPage() {
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery<Booking[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const response = await api.get<{ bookings: Booking[] }>('/api/bookings/my');
      // handle different structures gracefully
      return response.data.bookings || (Array.isArray(response.data) ? response.data : []);
    },
  });

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
      <div className="container mx-auto py-8 px-4 text-center text-destructive mt-12 bg-destructive/10 rounded-xl max-w-2xl border border-destructive/20">
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p>Failed to load your bookings. You might need to be logged in.</p>
      </div>
    );
  }

  const bookingList = Array.isArray(bookings) ? bookings : [];

  if (bookingList.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl text-center space-y-6 mt-12 border bg-card rounded-xl shadow-sm">
        <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mt-6 mb-6">
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
        return "bg-green-500 hover:bg-green-600 text-white";
      case "PENDING":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600 text-white";
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
          const carImage = car?.images && car.images.length > 0 ? getImageUrl(car.images[0].url) : null;

          return (
            <Card key={booking.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border">
              {carImage ? (
                <div className="h-48 w-full bg-muted border-b relative">
                  <img src={carImage} alt={car?.model || "Car"} className="w-full h-full object-cover" />
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
                {booking.status === "PENDING" && (
                  <FastCheckoutButton bookingId={booking.id} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
