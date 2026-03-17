import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <div className="group relative">
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_96%,var(--background))] px-3 py-2 pr-10 text-sm text-[var(--foreground)] shadow-[var(--shadow-sm)] transition duration-200 hover:border-[color:color-mix(in_srgb,var(--primary)_24%,var(--border))] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[var(--foreground-muted)] transition duration-200 group-hover:text-[var(--foreground)]">
        <ChevronDown className="h-4 w-4" strokeWidth={2.1} />
      </span>
    </div>
  ),
);

Select.displayName = "Select";
