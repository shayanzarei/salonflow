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
            "min-h-10 w-full appearance-none rounded-sm border bg-ink-0 px-4 pr-10 text-body-sm text-ink-900",
            "border-ink-200 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400",
            error ? "border-danger-600 focus-visible:border-danger-600" : "",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
