"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await api.post("/api/auth/sign-in/email", data);
      return res.data;
    },
    onSuccess: (data) => {
      // save token
      localStorage.setItem("token", data.token);

      // redirect
      router.push("/cars");
    },
    onError: (error: any) => {
      console.error(error);
      alert(error?.response?.data?.error || "Login failed");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-6">
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-center">
              Login
            </h2>

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

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}