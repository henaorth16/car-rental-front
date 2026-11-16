"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

type RegisterFormProps = {
  audience?: "user" | "agent";
};

export default function RegisterForm({ audience = "user" }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAgent = audience === "agent";
  const callbackURL = isAgent ? "/management/apply" : "/cars";

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
      callbackURL,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message ?? "Registration failed");
      return;
    }

    router.push(callbackURL);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-6">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              {isAgent ? "Agent Register" : "Register"}
            </h2>

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
            <p className="text-sm text-center text-muted-foreground">
              {isAgent ? (
                <>
                  Already have an agent account?{" "}
                  <Link href="/management/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </>
              )}
            </p>
            <p className="text-xs text-center text-muted-foreground">
              {isAgent ? (
                <>
                  Customer?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Use user register
                  </Link>
                </>
              ) : (
                <>
                  Agent?{" "}
                  <Link href="/management/apply" className="text-primary hover:underline">
                    Upgrade to agent
                  </Link>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}