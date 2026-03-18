"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  className?: string;
  href?: string;
  imageClassName?: string;
  priority?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
};

const sizeClasses = {
  sm: {
    image: "h-12 w-12",
    title: "text-lg",
    subtitle: "text-[10px] tracking-[0.18em]",
  },
  md: {
    image: "h-16 w-16",
    title: "text-xl",
    subtitle: "text-xs tracking-[0.2em]",
  },
  lg: {
    image: "h-20 w-20",
    title: "text-2xl",
    subtitle: "text-[13px] tracking-[0.22em]",
  },
} as const;

const imageScaleClasses = {
  sm: "scale-[1.55]",
  md: "scale-[1.65]",
  lg: "scale-[1.72]",
} as const;

export function BrandMark({
  className,
  href,
  imageClassName,
  priority = false,
  showLabel = true,
  size = "md",
  subtitle,
}: BrandMarkProps) {
  const content = (
    <span className={clsx("flex items-center gap-3.5", className)}>
      <span
        className={clsx(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))] ring-1 ring-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))]",
          sizeClasses[size].image,
          imageClassName,
        )}
      >
        <Image
          alt="DevTrack logo"
          className={clsx("h-full w-full object-contain", imageScaleClasses[size])}
          height={160}
          priority={priority}
          src="/devtrack.png"
          width={160}
        />
      </span>
      {showLabel ? (
        <span className="min-w-0 space-y-0.5">
          <span className={clsx("block font-semibold text-[var(--foreground)]", sizeClasses[size].title)}>
            DevTrack
          </span>
          {subtitle ? (
            <span
              className={clsx(
                "block uppercase text-[var(--foreground-muted)]",
                sizeClasses[size].subtitle,
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link aria-label="Go to DevTrack home" className="inline-flex" href={href}>
      {content}
    </Link>
  );
}
