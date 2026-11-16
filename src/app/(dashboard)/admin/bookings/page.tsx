"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Booking } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";
import {
  CalendarDays,
  Car as CarIcon,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Search,
  User,
  XCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["agent-bookings", page],
    queryFn: async () => {
      const res = await api.get<{
        bookings: Booking[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>("/api/bookings/agent", {
        params: { page, limit: 15 },
      });
      return {
        bookings: res.data?.bookings || (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 },
      };
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "CONFIRMED" | "CANCELLED" }) => {
      setUpdatingId(id);
      const res = await api.patch(`/api/bookings/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agent-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setUpdatingId(null);
      toast.success(
        variables.status === "CONFIRMED"
          ? "Reservation approved & confirmed!"
          : "Reservation cancelled."
      );
    },
    onError: (err: any) => {
      setUpdatingId(null);
      toast.error(err.response?.data?.error || err.message || "Failed to update booking status");
    },
  });

  const bookings = data?.bookings || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const carName = `${b.car?.brand || ""} ${b.car?.model || ""}`.toLowerCase();
      const userName = (b.user?.name || "").toLowerCase();
      const userEmail = (b.user?.email || "").toLowerCase();
      return carName.includes(q) || userName.includes(q) || userEmail.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-600 text-white">Confirmed</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500 text-white">Pending Approval</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fleet Reservations</h2>
          <p className="text-muted-foreground text-sm">
            Monitor, approve, and manage customer bookings on your vehicles.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customer or car..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((status) => {
          const count =
            status === "ALL"
              ? bookings.length
              : bookings.filter((b) => b.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === status
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Loading reservations...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl max-w-lg mx-auto">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Failed to load reservations</p>
          <p className="text-xs text-destructive/80 mt-1">Please ensure you are logged in with agent permissions.</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl space-y-3 bg-muted/10">
          <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-semibold">No Bookings Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {statusFilter !== "ALL"
              ? `There are no reservations with "${statusFilter.toLowerCase()}" status.`
              : "No customer reservations have been made for this fleet yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-xl bg-card overflow-hidden shadow-xs divide-y divide-border">
            {filteredBookings.map((b) => {
              const car = b.car;
              const user = b.user;
              const firstImage = car?.images && car.images.length > 0 ? car.images[0].url : null;
              const days = Math.max(
                1,
                Math.ceil(
                  (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              );
              const totalAmount =
                b.payment?.amount || (car ? car.pricePerDay * days : 0);

              return (
                <div
                  key={b.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-muted/20 transition-colors"
                >
                  {/* Left: Car & Customer Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0 border relative flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={getImageUrl(firstImage)}
                          alt={car?.model || "Car"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CarIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">
                          {car ? `${car.brand} ${car.model}` : "Car N/A"}
                        </h4>
                        {getStatusBadge(b.status)}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground">{user?.name || "Customer"}</span>
                        <span>({user?.email || "No email"})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(b.startDate).toLocaleDateString()} →{" "}
                          {new Date(b.endDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          {days} {days === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-0 border-border">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-foreground">{totalAmount} ETB</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span>{b.payment ? `Payment: ${b.payment.status}` : "Unpaid"}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateStatus({ id: b.id, status: "CONFIRMED" })}
                          disabled={updatingId === b.id}
                        >
                          {updatingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      )}

                      {b.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel this booking?")) {
                              updateStatus({ id: b.id, status: "CANCELLED" });
                            }
                          }}
                          disabled={updatingId === b.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
