"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useUiStore, type ToastItem } from "@/store/ui-store";

const toastToneStyles: Record<
  ToastItem["tone"],
  {
    container: string;
    icon: typeof CircleCheck;
    iconClassName: string;
  }
> = {
  success: {
    container:
      "border-[color:color-mix(in_srgb,var(--success)_30%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_10%,var(--surface))]",
    icon: CircleCheck,
    iconClassName: "text-[var(--success)]",
  },
  error: {
    container:
      "border-[color:color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_10%,var(--surface))]",
    icon: CircleAlert,
    iconClassName: "text-[var(--danger)]",
  },
  info: {
    container:
      "border-[color:color-mix(in_srgb,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))]",
    icon: Info,
    iconClassName: "text-[var(--primary)]",
  },
  warning: {
    container:
      "border-[color:color-mix(in_srgb,var(--warning)_32%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_10%,var(--surface))]",
    icon: TriangleAlert,
    iconClassName: "text-[var(--warning)]",
  },
};

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismissToast = useUiStore((state) => state.dismissToast);
  const toneStyle = toastToneStyles[toast.tone];
  const Icon = toneStyle.icon;

  useEffect(() => {
    const timeout = window.setTimeout(() => dismissToast(toast.id), 3200);
    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast.id]);

  return (
    <div
      className={`pointer-events-auto rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-md)] backdrop-blur ${toneStyle.container}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${toneStyle.iconClassName}`}>
          <Icon className="h-5 w-5" strokeWidth={2.1} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">{toast.title}</p>
          {toast.description ? (
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">{toast.description}</p>
          ) : null}
        </div>
        <Button
          aria-label="Dismiss notification"
          className="h-8 w-8 shrink-0 rounded-full p-0"
          onClick={() => dismissToast(toast.id)}
          type="button"
          variant="ghost"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
