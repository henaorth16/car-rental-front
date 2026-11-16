"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  audience?: "user" | "agent";
};

export default function LoginForm({ audience = "user" }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAgent = audience === "agent";
  const callbackURL = isAgent ? "/management" : "/cars";

  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message ?? "Login failed");
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
              {isAgent ? "Agent Login" : "Login"}
            </h2>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

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
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {isAgent ? (
                <>
                  No agent account?{" "}
                  <Link href="/management/register" className="text-primary hover:underline">
                    Register as agent
                  </Link>
                </>
              ) : (
                <>
                  No account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Register
                  </Link>
                </>
              )}
            </p>
            <p className="text-xs text-center text-muted-foreground">
              {isAgent ? (
                <>
                  Customer?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Use user login
                  </Link>
                </>
              ) : (
                <>
                  Agent?{" "}
                  <Link href="/management/login" className="text-primary hover:underline">
                    Use agent login
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