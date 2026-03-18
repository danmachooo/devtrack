"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function InternalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Workspace route failed to load"
      description="DevTrack could not render this internal route right now. Try again in a moment."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
