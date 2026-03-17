"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";

type InfoPopoverProps = {
  label: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  align?: "left" | "right";
};

export function InfoPopover({
  label,
  children,
  className,
  panelClassName,
  align = "right",
}: InfoPopoverProps) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 16, top: 16 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !panelRef.current) {
      return;
    }

    const gap = 8;
    const viewportPadding = 16;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();

    const preferredLeft =
      align === "left" ? triggerRect.left : triggerRect.right - panelRect.width;
    const maxLeft = window.innerWidth - panelRect.width - viewportPadding;
    const clampedLeft = Math.min(Math.max(preferredLeft, viewportPadding), Math.max(maxLeft, viewportPadding));

    setPosition({
      left: clampedLeft,
      top: triggerRect.bottom + gap,
    });
  }, [align, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !panelRef.current) {
        return;
      }

      const gap = 8;
      const viewportPadding = 16;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      const preferredLeft =
        align === "left" ? triggerRect.left : triggerRect.right - panelRect.width;
      const maxLeft = window.innerWidth - panelRect.width - viewportPadding;

      setPosition({
        left: Math.min(
          Math.max(preferredLeft, viewportPadding),
          Math.max(maxLeft, viewportPadding),
        ),
        top: triggerRect.bottom + gap,
      });
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, isOpen]);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        aria-describedby={panelId}
        aria-label={label}
        ref={triggerRef}
        type="button"
        className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition hover:border-[color:color-mix(in_srgb,var(--primary)_28%,var(--border))] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] [&::-webkit-details-marker]:hidden"
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
            setIsOpen(false);
          }
        }}
        onFocus={() => setIsOpen(true)}
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      {typeof document !== "undefined"
        ? createPortal(
            <div
              className={cn(
                "fixed z-[70] w-[calc(100vw-2rem)] max-w-72 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--foreground-muted)] shadow-[var(--shadow-md)] transition duration-150",
                isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                panelClassName,
              )}
              id={panelId}
              ref={panelRef}
              role="tooltip"
              style={{ left: `${position.left}px`, top: `${position.top}px` }}
              tabIndex={-1}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
