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
    image: "h-10 w-10",
    title: "text-base",
    subtitle: "text-[9px] tracking-[0.14em]",
  },
  md: {
    image: "h-14 w-14",
    title: "text-lg",
    subtitle: "text-[10px] tracking-[0.14em]",
  },
  lg: {
    image: "h-20 w-20",
    title: "text-2xl",
    subtitle: "text-xs tracking-[0.16em]",
  },
} as const;

const imageScaleClasses = {
  sm: "scale-[1.5]",
  md: "scale-[1.6]",
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
        <span className="min-w-0 space-y-px">
          <span className={clsx("block font-semibold text-[var(--foreground)]", sizeClasses[size].title)}>
            DevTrack
          </span>
          {subtitle ? (
            <span
              className={clsx(
                "block uppercase text-[color:color-mix(in_srgb,var(--foreground-muted)_88%,var(--surface))]",
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
