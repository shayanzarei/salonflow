"use client";

import { cn } from "@/lib/cn";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export function Select({
  id,
  label,
  helperText,
  error,
  className,
  children,
  ...props
}: SelectProps) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={id} className="text-label font-medium text-ink-700">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "min-h-11 w-full appearance-none rounded-sm border bg-ink-0 px-4 pr-9 text-body-sm text-ink-900",
            "border-ink-200 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none",
            error ? "border-danger-600 focus-visible:border-danger-600" : "",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500">
          v
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-caption text-danger-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-caption text-ink-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
