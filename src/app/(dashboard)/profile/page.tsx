"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Car,
  Clock,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN";
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  agentProfile?: {
    businessName: string;
    businessPhone?: string;
    officeAddress?: string;
  };
  _count?: {
    bookings: number;
    ownedCars: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch complete user profile from backend
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await api.get<{ user: UserProfile }>("/api/users/me");
      return res.data.user;
    },
    enabled: !!session?.user,
  });

  // Populate form with existing profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const { mutate: updateProfile, isPending: isSaving } = useMutation({
    mutationFn: async (payload: { name: string; phoneNumber: string; address: string }) => {
      const res = await api.put("/api/users/me", payload);
      return res.data;
    },
    onSuccess: () => {
      setFeedback({ type: "success", text: "Profile details updated successfully." });
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || err.message || "Failed to update profile.";
      setFeedback({
        type: "error",
        text: errMsg,
      });
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    updateProfile({ name, phoneNumber, address });
  };

  const handleLogout = async () => {
    await authClient.signOut();
    toast.info("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  if (isAuthPending || (isProfileLoading && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Please Sign In</h2>
          <p className="text-sm text-muted-foreground">
            You must be logged in to access and manage your profile account.
          </p>
        </div>
        <Link href="/login?callbackURL=/profile" className="block">
          <Button className="w-full">Sign In</Button>
        </Link>
      </div>
    );
  }

  const role = profile?.role || (session.user as any)?.role || "USER";
  const isAgentOrAdmin = role === "AGENT" || role === "ADMIN";

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-card border rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : session.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">{profile?.name || session.user.name}</h1>
              <Badge
                className={
                  role === "ADMIN"
                    ? "bg-purple-600 text-white"
                    : role === "AGENT"
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-foreground"
                }
              >
                {role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.email || session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {role === "USER" ? (
            <Link href="/management/apply" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Become an Agent
              </Button>
            </Link>
          ) : (
            <Link href="/admin" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Management Dashboard
              </Button>
            </Link>
          )}

          <Button variant="destructive" onClick={handleLogout} className="shrink-0 gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Account Overview & Quick Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-primary" /> Reservations
                </div>
                <div className="text-2xl font-bold">{profile?._count?.bookings ?? 0}</div>
                <p className="text-[11px] text-muted-foreground">Total car bookings made</p>
              </CardContent>
            </Card>

            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <Car className="w-4 h-4 text-primary" /> Fleet Cars
                </div>
                <div className="text-2xl font-bold">
                  {isAgentOrAdmin ? profile?._count?.ownedCars ?? 0 : "—"}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isAgentOrAdmin ? "Vehicles managed" : "Agent feature"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation Links */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              <Link
                href="/bookings"
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">My Bookings</p>
                    <p className="text-xs text-muted-foreground">View and manage rental reservations</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/cars"
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Explore Fleet</p>
                    <p className="text-xs text-muted-foreground">Browse all available vehicles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              {isAgentOrAdmin && (
                <Link
                  href="/admin/cars/new"
                  className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">List a Vehicle</p>
                      <p className="text-xs text-muted-foreground">Add new car to rental inventory</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Business Info if Agent */}
          {profile?.agentProfile && (
            <Card className="border bg-primary/5 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Business: </span>
                  <span className="font-semibold">{profile.agentProfile.businessName}</span>
                </div>
                {profile.agentProfile.businessPhone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-semibold">{profile.agentProfile.businessPhone}</span>
                  </div>
                )}
                {profile.agentProfile.officeAddress && (
                  <div>
                    <span className="text-muted-foreground">Office: </span>
                    <span className="font-semibold">{profile.agentProfile.officeAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Edit Contact Details Form */}
        <div className="lg:col-span-7">
          <Card className="border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Personal & Contact Information</CardTitle>
              <CardDescription>
                Update your account details and contact preferences for rental agreements.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {feedback && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-sm font-medium animate-in fade-in duration-200 ${
                      feedback.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-primary" /> Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                  </label>
                  <Input
                    type="email"
                    value={profile?.email || session.user.email || ""}
                    disabled
                    className="h-11 bg-muted/50 cursor-not-allowed text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email address is tied to your login credentials and cannot be changed here.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Residential / Office Address
                  </label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Bole, Addis Ababa, Ethiopia"
                    className="h-11"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={isSaving} className="w-full sm:w-auto px-8">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
