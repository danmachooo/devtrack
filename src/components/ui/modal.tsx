"use client";

import { X } from "lucide-react";
import { type PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
}>;

export function Modal({ open, onClose, title, description, className, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] px-4 py-8 backdrop-blur-sm sm:items-center">
      <button
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]",
          className,
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{title}</h2>
            {description ? (
              <p className="max-w-xl text-sm text-[var(--foreground-muted)]">{description}</p>
            ) : null}
          </div>
          <Button aria-label="Close modal" onClick={onClose} type="button" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
