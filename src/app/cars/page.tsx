"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/lib/types";
import { CarCard } from "@/components/CarCard";
import { Car as CarIcon, Loader2 } from "lucide-react";

export default function CarsListPage() {
  const { data: cars, isLoading, error } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data } = await api.get<Car[] | { cars: Car[] } | { data: Car[] }>("/api/cars");
      if ("cars" in data) return data.cars;
      return [];
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3   bg-primary/10">
          <CarIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Our Fleet</h1>
          <p className="text-muted-foreground mt-1">
            Choose from our wide variety of vehicles for your next journey.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading fleet...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive bg-destructive/10    border border-destructive/20 max-w-2xl mx-auto mt-8">
          Failed to load cars. Please try again later.
        </div>
      ) : !cars || cars.length === 0 ? (
        <div className="text-center py-32 text-muted-foreground bg-muted/30    border border-dashed flex flex-col items-center mt-8">
          <CarIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">No cars available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}