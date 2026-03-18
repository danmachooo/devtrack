"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function ClientError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Client dashboard failed to load"
      description="DevTrack could not render this client view right now. Try again in a moment."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
