"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { signUp } from "@/lib/api/auth.api";
import { signUpSchema, type SignUpFormValues } from "@/features/auth/auth.schemas";

export default function SignUpPage() {
  const router = useRouter();
  const { data: sessionData, isPending: isSessionPending } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      router.replace("/sign-in?created=1");
    },
  });

  useEffect(() => {
    if (!isSessionPending && sessionData?.data.session && sessionData.data.user) {
      router.replace("/dashboard");
    }
  }, [isSessionPending, router, sessionData]);

  const onSubmit = handleSubmit((values) => {
    signUpMutation.mutate(values);
  });

  return (
    <Card className="space-y-6 p-8">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
          Create Account
        </p>
        <h1 className="text-3xl font-semibold">Start your DevTrack workspace</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Set up your internal account first. Organization activation comes right after sign-in.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Full name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name ? <p className="text-sm text-[var(--danger)]">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-[var(--danger)]">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-[var(--danger)]">{errors.password.message}</p>
          ) : null}
        </div>

        {signUpMutation.isError ? (
          <p className="text-sm text-[var(--danger)]">
            Account creation failed. Try again in a moment.
          </p>
        ) : null}

        <Button className="w-full" disabled={isSubmitting || signUpMutation.isPending} type="submit">
          {isSubmitting || signUpMutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-[var(--foreground-muted)]">
        Already have an account?{" "}
        <Link className="font-semibold text-[var(--primary)]" href="/sign-in">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
