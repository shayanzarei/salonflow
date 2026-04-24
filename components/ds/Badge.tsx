import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "brand";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-ink-100 text-ink-700",
  info: "bg-info-50 text-info-600",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  brand: "bg-brand-50 text-brand-700",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[22px] items-center rounded-full px-2.5 text-caption font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
