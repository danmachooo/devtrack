import { Lightbulb, Sparkles } from "lucide-react";

type FeatureEmptyEditorProps = {
  canManageFeatures: boolean;
  hasFeatures: boolean;
};

export function FeatureEmptyEditor({
  canManageFeatures,
  hasFeatures,
}: FeatureEmptyEditorProps) {
  return (
    <div className="space-y-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_94%,var(--background))_0%,var(--background)_100%)] p-6 shadow-[var(--shadow-sm)]">
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Feature editor
        </p>
        <h3 className="text-xl font-semibold tracking-tight">
          {hasFeatures ? "Choose a feature to edit" : "No feature selected yet"}
        </h3>
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">
          {hasFeatures
            ? "Use the list on the left to focus one feature at a time. This keeps naming, ordering, and delete decisions deliberate."
            : canManageFeatures
              ? "Create the first client-facing feature so synced work can be grouped into a clearer delivery narrative."
              : "Feature groups have not been created yet. Team Leaders and Business Analysts can add the first feature here."}
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
            <Lightbulb className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Naming guidance</h4>
            <ul className="space-y-2 text-sm leading-6 text-[var(--foreground-muted)]">
              <li>Favor client-visible deliverables over internal team names or technical layers.</li>
              <li>Keep names specific enough that progress makes sense without extra explanation.</li>
              <li>Examples: Client Portal, Billing Rollout, Reporting Dashboard, Mobile Onboarding.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
