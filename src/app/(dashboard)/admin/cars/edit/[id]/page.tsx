"use client";

import CarForm from "@/components/forms/CarForm";
import { api } from "@/lib/axios";
import { Car } from "@/types/car";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Car as CarIcon } from "lucide-react";
import Link from "next/link";

import React from "react";

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: car } = useQuery({
    queryKey: ["car", id],
    queryFn: () => api.get<{car: Car}>(`/api/cars/${id}`).then((res) => res.data.car),
  });

  if (!car) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cars"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Cars
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CarIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Car</h1>
          <p className="text-sm text-muted-foreground">
            Update the car's details and photos.
          </p>
        </div>
      </div>

      {/* Form Component */}
      <CarForm initialData={car} />
    </div>
  );
}