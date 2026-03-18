"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Authentication page failed to load"
      description="DevTrack could not render this auth route right now. Try again in a moment."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
