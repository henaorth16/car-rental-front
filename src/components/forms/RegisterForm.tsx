"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/cars",
    });

    setIsLoading(false);

    if (error) {
      setError(error.message ?? "Registration failed");
      return;
    }

    router.push("/cars");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-6">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Register</h2>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Input
              placeholder="Name"
              type="text"
              {...form.register("name", { required: true })}
            />

            <Input
              placeholder="Email"
              type="email"
              {...form.register("email", { required: true })}
            />

            <Input
              placeholder="Password"
              type="password"
              {...form.register("password", { required: true })}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}