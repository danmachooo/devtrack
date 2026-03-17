"use client";

import { X } from "lucide-react";
import { type PropsWithChildren, useEffect, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 backdrop-blur-sm transition duration-200 sm:items-center ${
        isVisible
          ? "bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)]"
          : "bg-[color:color-mix(in_srgb,var(--foreground)_0%,transparent)]"
      }`}
    >
      <button
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        aria-modal="true"
        className={cn(
          `relative z-10 flex max-h-[min(88vh,56rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] transition duration-200 ${
            isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.985] opacity-0"
          }`,
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

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
