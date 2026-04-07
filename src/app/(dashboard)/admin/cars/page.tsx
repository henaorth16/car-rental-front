"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export default function AdminCarsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: cars, isLoading, error } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data } = await api.get<Car[] | { cars: Car[] } | { data: Car[] }>("/api/cars");
      if ("cars" in data) return data.cars;
      return [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
    },
  });

  const filteredCars = cars?.filter((car) =>
    car.brand.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase()) ||
    car.type.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading cars...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error loading cars</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Cars</h2>
          <p className="text-muted-foreground">
            Manage your vehicle fleet and inventory
          </p>
        </div>
        <Button onClick={() => router.push("/admin/cars/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Car
        </Button>
      </div>

      <div className="flex justify-end">
        <Input
          placeholder="Search cars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCars.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No cars found</p>
          </div>
        ) : (
          filteredCars.map((car) => (
            <Card key={car.id} className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-xl">
                      {car.brand} {car.model}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {car.type}
                    </p>
                  </div>
                  <Badge variant={car.available ? "default" : "secondary"}>
                    {car.available ? "Available" : "Booked"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      ${car.pricePerDay}/day
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/cars/edit/${car.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(car.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}