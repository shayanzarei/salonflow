import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  optionalLabel?: string;
};

export function Input({
  id,
  label,
  helperText,
  error,
  optionalLabel,
  className,
  ...props
}: InputProps) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={id}
          className="text-label font-medium text-ink-700"
        >
          {label}{" "}
          {optionalLabel ? (
            <span className="font-normal text-ink-400">{optionalLabel}</span>
          ) : null}
        </label>
      ) : null}
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "min-h-12 rounded-sm border bg-ink-0 px-4 text-body text-ink-900 placeholder:text-ink-400",
          "border-ink-200 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none",
          error
            ? "border-danger-600 focus-visible:border-danger-600"
            : "",
          className
        )}
        {...props}
      />
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
