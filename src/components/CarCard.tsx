"use client"
import React from "react";
import Link from "next/link";
import { Car } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car as CarIcon } from "lucide-react";

import { getImageUrl } from "@/lib/utils";

export function CarCard({ car }: { car: Car }) {
  const firstImage = car.images && car.images.length > 0 ? car.images[0].url : null;

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image Placeholder or Actual Image */}
      <div className="w-full h-48 bg-muted flex items-center justify-center border-b relative overflow-hidden">
        {firstImage ? (
          <img
            src={getImageUrl(firstImage)}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <CarIcon className="w-16 h-16 text-muted-foreground/30" />
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-xl">{car.brand} {car.model}</CardTitle>
            <CardDescription>{car.type}</CardDescription>
          </div>
          <Badge variant={car.available ? "default" : "secondary"}>
            {car.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="grow space-y-4">
        <div className="text-2xl font-bold">
          {car.pricePerDay} ETB<span className="text-sm font-normal text-muted-foreground"> / day</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/cars/${car.id}`} className={buttonVariants({ className: "w-full" })}>
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
