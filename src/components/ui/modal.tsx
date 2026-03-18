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
          ? "bg-[color:color-mix(in_srgb,var(--foreground)_36%,transparent)]"
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
          `relative z-10 flex max-h-[min(92vh,56rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[calc(var(--radius-lg)+0.25rem)] border border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,var(--background))] p-0 shadow-[var(--shadow-md)] transition duration-200 ${
            isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.985] opacity-0"
          }`,
          className,
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] px-4 py-4 sm:px-6 sm:py-5">
          <div className="space-y-1.5">
            <h2 className="max-w-2xl text-xl font-semibold text-balance sm:text-2xl">{title}</h2>
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] text-pretty">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Close modal"
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] p-0"
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
