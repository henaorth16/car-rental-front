"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car as CarIcon,
  CreditCard,
  Users as UsersIcon,
  CalendarDays,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { authClient } from "@/lib/auth-client";
import { Car, Booking, User, Payment } from "@/lib/types";

// TypeScript interfaces based on Prisma schema

export default function AdminDashboardPage() {
  const { data: session } = authClient.useSession();
  const role = String(
    (session?.user as { role?: string } | undefined)?.role ?? "AGENT",
  ).toUpperCase();
  const isAdmin = role === "ADMIN";

  const { data: cars, isLoading: isLoadingCars } = useQuery({
    queryKey: ["admin-cars", isAdmin],
    queryFn: async () => {
      const endpoint = isAdmin ? "/api/cars" : "/api/cars/my";
      const { data } = await api.get<
        | Car[]
        | {
            cars: Car[];
            data?: Car[];
          }
      >(endpoint);
      return Array.isArray(data) ? data : data?.cars || data?.data || [];
    },
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await api.get<
        | Booking[]
        | {
            bookings: Booking[];
            data?: Booking[];
          }
      >("/api/bookings/agent");
      return Array.isArray(data) ? data : data?.bookings || data?.data || [];
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get<User[] | { users: User[]; data?: User[] }>("/api/users");
      return Array.isArray(data) ? data : data?.users || data?.data || [];
    },
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data } = await api.get<Payment[] | { payments: Payment[]; data?: Payment[] }>(
        "/api/payments",
      );
      return Array.isArray(data) ? data : data?.payments || data?.data || [];
    },
  });

  // Calculate actual stats based on fetched data
  const totalCars = cars?.length || 0;
  const activeBookings =
    bookings?.filter((b) => b.status === "CONFIRMED").length || 0;

  // Calculate total successful revenue
  const totalRevenue =
    payments
      ?.filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

  // Format as currency
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRevenue);

  const totalUsers = users?.length || 0;

  const isLoading =
    isLoadingCars || isLoadingBookings || isLoadingUsers || isLoadingPayments;

  const statsMenuItems = [
    {
      title: isAdmin ? "Total Vehicles" : "My Vehicles",
      value: isLoading ? "..." : totalCars.toString(),
      description: isAdmin ? "Available in fleet" : "In your fleet",
      icon: CarIcon,
      href: "/admin/cars",
    },
    {
      title: isAdmin ? "Pending Bookings" : "My Bookings",
      value: isLoading ? "..." : activeBookings.toString(),
      description: isAdmin
        ? "Confirmed reservations"
        : "Reservations on your fleet",
      icon: CalendarDays,
      href: "/admin/bookings",
    },
    ...(isAdmin
      ? [
          {
            title: "Total Revenue",
            value: isLoading ? "..." : formattedRevenue,
            description: "From successful payments",
            icon: CreditCard,
            href: "/admin",
          },
          {
            title: "Total Users",
            value: isLoading ? "..." : totalUsers.toString(),
            description: "Registered customers",
            icon: UsersIcon,
            href: "/admin/users",
          },
        ]
      : []),
  ];

  // Show only up to 5 latest bookings, sort by creation date descending
  const recentBookings = [...(bookings || [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              {isAdmin ? "Admin Dashboard" : "Agent Dashboard"}
            </h2>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 uppercase tracking-wider"
            >
              {(session?.user as any)?.role ?? "ADMIN"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Welcome back,{" "}
            <span className="font-medium text-foreground">
              {session?.user?.name ??
                session?.user?.email ??
                (isAdmin ? "Admin" : "Agent")}
            </span>{" "}
            👋
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsMenuItems.map((stat, index) => (
          <Link
            href={stat.href}
            key={index}
            className="transition-all hover:scale-[1.02]"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
            <CardDescription>
              A summary of the recent engagements and bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px] flex items-center justify-center border-t border-muted/50 mt-4 bg-muted/10 rounded-b-xl">
            <div className="flex flex-col items-center text-muted-foreground">
              <Activity className="h-10 w-10 mb-2 opacity-50" />
              <p>Analytics Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest car rentals and reservations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative">
              {isLoadingBookings ? (
                <div className="flex flex-col gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-3 w-16 bg-muted rounded"></div>
                      </div>
                      <div className="h-4 w-12 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-10">
                  No recent bookings found.
                </p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {booking.user?.name ||
                          booking.user?.email ||
                          "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.car
                          ? `${booking.car.brand} ${booking.car.model}`
                          : "Car N/A"}{" "}
                        • {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className={`text-xs px-2 py-1    font-medium shadow-sm border ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                            : booking.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
