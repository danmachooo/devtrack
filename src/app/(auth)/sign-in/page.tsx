import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card className="space-y-4 p-8">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
          Internal Workspace
        </p>
        <h1 className="text-3xl font-semibold">Sign in to DevTrack</h1>
      </div>
      <p className="text-sm text-[var(--foreground-muted)]">
        Foundation scaffold in place. Form wiring comes next.
      </p>
    </Card>
  );
}
