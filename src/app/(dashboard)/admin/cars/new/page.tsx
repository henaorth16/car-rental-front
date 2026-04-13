"use client";

import CarForm from "@/components/forms/CarForm";
import { ChevronLeft, Car as CarIcon } from "lucide-react";
import Link from "next/link";

export default function NewCarPage() {
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
        <div className="p-2   bg-primary/10">
          <CarIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Car</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to add a car to the fleet.
          </p>
        </div>
      </div>

      {/* Form Component */}
      <CarForm />
    </div>
  );
}