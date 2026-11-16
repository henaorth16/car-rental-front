"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type BecomeAgentFormValues = {
  businessName: string;
  businessPhone: string;
  officeAddress: string;
};

export default function BecomeAgentForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BecomeAgentFormValues>({
    defaultValues: {
      businessName: "",
      businessPhone: "",
      officeAddress: "",
    },
  });

  const onSubmit = async (values: BecomeAgentFormValues) => {
    setError(null);
    setIsLoading(true);

    if (!session?.user) {
      setError("Please login to continue.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/register-agent`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(
          payload?.message ??
            payload?.error ??
            "Agent registration failed. Please try again.",
        );
        setIsLoading(false);
        console.log(payload, 'response is not ok');
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Agent registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Become an Agent</h2>
            <p className="text-sm text-center text-muted-foreground">
              Complete your business profile to upgrade your role.
            </p>

            {error ? <p className="text-sm text-red-500 text-center">{error}</p> : null}

            <Input
              placeholder="Business Name"
              type="text"
              {...form.register("businessName", { required: true })}
            />
            <Input
              placeholder="Business Phone"
              type="text"
              {...form.register("businessPhone", { required: true })}
            />
            <Input
              placeholder="Office Address"
              type="text"
              {...form.register("officeAddress", { required: true })}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Register as Agent"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
