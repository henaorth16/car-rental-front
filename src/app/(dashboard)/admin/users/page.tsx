"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  Users as UsersIcon,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  Car,
  Briefcase,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ManagementGuard from "@/components/auth/ManagementGuard";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN";
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  _count?: {
    bookings: number;
    ownedCars: number;
  };
}

function UsersListContent() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const { data: users, isLoading, error } = useQuery<UserItem[]>({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const res = await api.get<{ users: UserItem[] }>("/api/users");
      return res.data?.users || (Array.isArray(res.data) ? res.data : []);
    },
  });

  const userList = users || [];

  const filteredUsers = userList.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phoneNumber || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-600 text-white">Administrator</Badge>;
      case "AGENT":
        return <Badge className="bg-blue-600 text-white">Fleet Agent</Badge>;
      case "USER":
      default:
        return <Badge variant="secondary">Customer</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer & User Directory</h2>
          <p className="text-muted-foreground text-sm">
            View registered customers, fleet agents, and rental client histories.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "USER", "AGENT", "ADMIN"].map((r) => {
          const count =
            r === "ALL" ? userList.length : userList.filter((u) => u.role === r).length;
          const label =
            r === "ALL" ? "All Users" : r === "USER" ? "Customers" : r === "AGENT" ? "Agents" : "Admins";

          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  roleFilter === r
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

      {/* Directory Table / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Loading user directory...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl max-w-lg mx-auto">
          <p className="font-semibold">Unable to load users</p>
          <p className="text-xs text-destructive/80 mt-1">Please ensure you have management access permissions.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl space-y-3 bg-muted/10">
          <UsersIcon className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-semibold">No Users Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search ? `No user matches the query "${search}".` : "No registered users in this category."}
          </p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden shadow-xs divide-y divide-border">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
            >
              {/* Left: Avatar & Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20 shrink-0">
                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-foreground">{u.name || "Unnamed User"}</h4>
                    {getRoleBadge(u.role)}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {u.email}
                    </span>
                    {u.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {u.phoneNumber}
                      </span>
                    )}
                    {u.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {u.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Activity Stats & Joined Date */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="text-center sm:text-right">
                    <div className="font-bold text-sm text-foreground">
                      {u._count?.bookings ?? 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Bookings</div>
                  </div>

                  {u.role !== "USER" && (
                    <div className="text-center sm:text-right">
                      <div className="font-bold text-sm text-foreground">
                        {u._count?.ownedCars ?? 0}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Fleet Cars</div>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" /> Joined{" "}
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ManagementGuard>
      <UsersListContent />
    </ManagementGuard>
  );
}
