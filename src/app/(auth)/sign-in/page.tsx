"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { signIn } from "@/lib/api/auth.api";
import { signInSchema, type SignInFormValues } from "@/features/auth/auth.schemas";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: sessionData, isPending: isSessionPending } = useSession();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const created = searchParams.get("created") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.replace(nextPath);
    },
  });

  useEffect(() => {
    if (!isSessionPending && sessionData?.data.session && sessionData.data.user) {
      router.replace("/dashboard");
    }
  }, [isSessionPending, router, sessionData]);

  const onSubmit = handleSubmit((values) => {
    signInMutation.mutate(values);
  });

  return (
    <Card className="space-y-6 p-8">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
          Internal Workspace
        </p>
        <h1 className="text-3xl font-semibold">Sign in to DevTrack</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Step into the internal workspace and pick up delivery where the team left off.
        </p>
      </div>

      {created ? (
        <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_10%,var(--surface))] px-4 py-3 text-sm text-[var(--foreground)]">
          Account created. Sign in to continue into the workspace.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
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
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-[var(--danger)]">{errors.password.message}</p>
          ) : null}
        </div>

        {signInMutation.isError ? (
          <p className="text-sm text-[var(--danger)]">
            Sign-in failed. Check your credentials and try again.
          </p>
        ) : null}

        <Button className="w-full" disabled={isSubmitting || signInMutation.isPending} type="submit">
          {isSubmitting || signInMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-[var(--foreground-muted)]">
        New to DevTrack?{" "}
        <Link className="font-semibold text-[var(--primary)]" href="/sign-up">
          Create an account
        </Link>
      </p>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<Card className="p-8 text-sm text-[var(--foreground-muted)]">Loading sign in...</Card>}>
      <SignInForm />
    </Suspense>
  );
}
