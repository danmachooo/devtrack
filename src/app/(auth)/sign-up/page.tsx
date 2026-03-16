import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card className="space-y-4 p-8">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
          Create Account
        </p>
        <h1 className="text-3xl font-semibold">Start your DevTrack workspace</h1>
      </div>
      <p className="text-sm text-[var(--foreground-muted)]">
        Sign-up form structure will use React Hook Form and Zod in the next phase.
      </p>
    </Card>
  );
}
