"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Edit2, CheckCircle2, XCircle, Loader2, Car as CarIcon, Search, Eye, Power } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminCarsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const role = String(
    (session as any)?.session?.custom?.role ??
      (session as any)?.custom?.role ??
      (session as any)?.user?.role ??
      "AGENT",
  ).toUpperCase();
  const isAdmin = role === "ADMIN";

  const { data: cars, isLoading, error } = useQuery({
    queryKey: ["admin-cars", isAdmin],
    queryFn: async () => {
      const endpoint = isAdmin ? "/api/cars" : "/api/cars/my";
      const { data } = await api.get<Car[] | { cars: Car[] } | { data: Car[] }>(endpoint);
      if (Array.isArray(data)) return data;
      return (data as any)?.cars || (data as any)?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      toast.success("Vehicle deleted from fleet");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to delete car");
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      setTogglingId(id);
      const res = await api.put(`/api/cars/${id}`, { available });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      setTogglingId(null);
      toast.success(
        variables.available
          ? "Vehicle marked as AVAILABLE"
          : "Vehicle marked as UNAVAILABLE"
      );
    },
    onError: (err: any) => {
      setTogglingId(null);
      toast.error(err.response?.data?.error || err.message || "Failed to update availability");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the fleet?`)) {
      deleteMutation.mutate(id);
    }
  };

  const carList = Array.isArray(cars) ? cars : [];
  const filteredCars = carList.filter(
    (car) =>
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.type.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fleet Vehicles</h2>
          <p className="text-muted-foreground text-sm">
            {isAdmin
              ? "All registered vehicles across the entire rental platform"
              : "Vehicles listed under your fleet management account"}
          </p>
        </div>
        <Button onClick={() => router.push("/admin/cars/new")} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Vehicle
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCars.length}</span> of{" "}
          <span className="font-semibold text-foreground">{carList.length}</span> vehicles
        </p>

        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search make, model, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Loading fleet inventory...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl max-w-lg mx-auto">
          <p className="font-semibold">Failed to load fleet vehicles</p>
          <p className="text-xs text-destructive/80 mt-1">Please ensure your backend server is online.</p>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl space-y-4 bg-muted/10">
          <CarIcon className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No Vehicles Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {search
                ? `No vehicles match your search "${search}".`
                : "You have not added any vehicles to your fleet yet."}
            </p>
          </div>
          <Button onClick={() => router.push("/admin/cars/new")} size="sm" className="gap-1.5 mt-2">
            <Plus className="w-4 h-4" /> List Your First Car
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCars.map((car) => {
            const firstImage = car.images && car.images.length > 0 ? car.images[0].url : null;
            const isToggling = togglingId === car.id;

            return (
              <Card key={car.id} className="hover:shadow-md transition-shadow overflow-hidden group border flex flex-col">
                <div className="aspect-video w-full bg-muted relative border-b overflow-hidden">
                  {firstImage ? (
                    <img
                      src={getImageUrl(firstImage)}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CarIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}

                  <Badge
                    className={`absolute top-3 right-3 shadow-sm border-none ${
                      car.available ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {car.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                <CardHeader className="py-4 grow">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {car.brand} {car.model}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {car.type} • {car.transmission?.toLowerCase()} • {car.fuelType?.toLowerCase()}
                      </CardDescription>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-foreground">{car.pricePerDay} ETB</span>
                      <span className="text-xs text-muted-foreground block">/ day</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 border-t p-4 space-y-3 bg-muted/10">
                  <div className="flex items-center justify-between gap-2">
                    {/* Toggle Available */}
                    <Button
                      variant={car.available ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        toggleAvailabilityMutation.mutate({
                          id: car.id,
                          available: !car.available,
                        })
                      }
                      disabled={isToggling}
                      className="text-xs gap-1.5 grow"
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                      {car.available ? "Set Unavailable" : "Set Available"}
                    </Button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link href={`/cars/${car.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" title="View customer page">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => router.push(`/admin/cars/edit/${car.id}`)}
                        title="Edit vehicle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleDelete(car.id, `${car.brand} ${car.model}`)}
                        disabled={deleteMutation.isPending}
                        title="Delete vehicle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
