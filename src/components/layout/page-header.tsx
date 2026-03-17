import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, description, actions, icon, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {icon ? (
          <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)] shadow-[var(--shadow-sm)]">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 space-y-1.5">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-[var(--foreground-muted)] text-pretty">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 md:justify-end">{actions}</div> : null}
    </div>
  );
}
