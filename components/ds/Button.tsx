"use client";

import { cn } from "@/lib/cn";
import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "link"
  | "accent"
  | "dark"
  | "outlineDark"
  | "glass";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-900",
  accent:
    "border-transparent bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-600",
  dark:
    "border-transparent bg-ink-900 text-white hover:bg-ink-700 active:bg-ink-950",
  outlineDark:
    "border-2 border-ink-900 bg-transparent text-ink-900 hover:bg-ink-900 hover:text-white",
  glass:
    "border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/15",
  secondary:
    "border-ink-200 bg-ink-0 text-ink-900 hover:bg-ink-100 active:bg-ink-200",
  ghost: "border-transparent bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  danger:
    "border-transparent bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700",
  link: "h-auto border-transparent bg-transparent p-0 text-brand-600 underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 rounded-sm px-3 text-label",
  md: "min-h-10 rounded-md px-4 text-body-sm",
  lg: "min-h-12 rounded-md px-5 text-body",
  xl: "min-h-14 rounded-full px-7 text-base font-semibold",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 border font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-base ease-standard",
    "focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    variant === "link" ? "" : sizeClasses[size],
    className
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
