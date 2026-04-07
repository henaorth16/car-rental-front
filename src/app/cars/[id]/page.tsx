"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/types/car";
import {
  Car as CarIcon,
  Loader2,
  ChevronLeft,
  Calendar,
  Fuel,
  Settings2,
  Users,
  DoorOpen,
  Palette,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import React from "react";
import { getImageUrl } from "@/lib/utils";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const {
    data: car,
    isLoading,
    error,
  } = useQuery<Car>({
    queryKey: ["cars", id],
    queryFn: async () => {
      const { data } = await api.get<{ car: Car }>(`/api/cars/${id}`);
      console.log("car",JSON.stringify(data.car))
      return data.car;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">
          Loading car details...
        </p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-destructive mt-12 bg-destructive/10 rounded-xl max-w-2xl border border-destructive/20">
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p>Failed to load car details or the car doesn't exist.</p>
        <Link
          href="/cars"
          className={buttonVariants({ variant: "outline", className: "mt-6" })}
        >
          Return to Fleet
        </Link>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [];
  const currentImage = images[activeImageIndex].url;

  const specs = [
    { label: "Fuel Type", value: car.fuelType, icon: Fuel },
    { label: "Transmission", value: car.transmission, icon: Settings2 },
    { label: "Seats", value: `${car.seats} Seats`, icon: Users },
    { label: "Doors", value: `${car.doors} Doors`, icon: DoorOpen },
    { label: "Color", value: car.color, icon: Palette },
    { label: "Type", value: car.type, icon: Info },
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-6xl">
      {/* Back Link */}
      <Link
        href="/cars"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Fleet
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Image Gallery */}
        <div className="space-y-4">
          <div className="bg-muted rounded-2xl aspect-video lg:aspect-square flex flex-col items-center justify-center border shadow-sm relative overflow-hidden group">
            {currentImage ? (
              <img
                src={getImageUrl(currentImage)}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <CarIcon className="w-32 h-32 text-muted-foreground/20 mb-4 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-muted-foreground text-sm font-medium z-10">
                  No image available
                </p>
              </>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent"></div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                    activeImageIndex === idx
                      ? "border-primary scale-95"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(img.url)}
                    alt={`${car.brand} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {car.brand} {car.model}
                </h1>
                <p className="text-xl text-muted-foreground mt-2">{car.type}</p>
              </div>
              <Badge
                variant={car.available ? "default" : "secondary"}
                className="text-sm px-3 py-1 whitespace-nowrap"
              >
                {car.available ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 pt-6 border-t pb-2">
              <span className="text-4xl font-extrabold">{car.pricePerDay} ETB</span>
              <span className="text-muted-foreground font-medium">
                / per day
              </span>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border hover:shadow-sm transition-all"
              >
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <spec.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {spec.label}
                  </p>
                  <p className="font-semibold text-sm capitalize">
                    {spec.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {car.description || "No description provided for this vehicle."}
            </p>
          </div>

          <div className="pt-4 space-y-6">
            <div className="p-5 border rounded-xl bg-card shadow-sm">
              <h3 className="font-semibold mb-2">Rental Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Valid driver's license</li>
                <li>Minimum age 21 years</li>
                <li>Security deposit required at pickup</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full text-lg h-14 shadow-md hover:shadow-lg transition-all"
              disabled={!car.available}
            >
              {car.available ? "Book This Car" : "Currently Unavailable"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

