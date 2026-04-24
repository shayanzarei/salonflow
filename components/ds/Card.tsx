import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardVariant = "elevated" | "outlined" | "flat";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Visual style.
   * - `elevated` (default): soft shadow, no border.
   * - `outlined`: hairline border, no shadow.
   * - `flat`: neither — use when the card sits inside another surface.
   */
  variant?: CardVariant;
  /** Adds hover elevation for clickable cards. */
  interactive?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  elevated: "shadow-sm",
  outlined: "border border-ink-200",
  flat: "",
};

export function Card({
  className,
  variant = "elevated",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-ink-0 p-6",
        variantClasses[variant],
        interactive &&
          "cursor-pointer transition-shadow [transition-duration:var(--duration-base)] [transition-timing-function:var(--ease-standard)] hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}
