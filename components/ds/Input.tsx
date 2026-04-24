import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type InputSize = "sm" | "md" | "lg";

const sizeHeight: Record<InputSize, string> = {
  sm: "min-h-8",
  md: "min-h-10",
  lg: "min-h-12",
};

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  helperText?: string;
  error?: string;
  optionalLabel?: string;
  /** Input size. Defaults to `md` (40px) per spec. */
  inputSize?: InputSize;
  /** Icon or adornment on the left. */
  leading?: ReactNode;
  /** Icon or adornment on the right (e.g. password reveal). */
  trailing?: ReactNode;
  /** Dot marker for required fields. */
  required?: boolean;
};

function FieldLabel({
  htmlFor,
  label,
  optionalLabel,
  required,
}: {
  htmlFor?: string;
  label: string;
  optionalLabel?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-label font-medium text-ink-700"
    >
      {required ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-danger-600"
        />
      ) : null}
      <span>
        {label}
        {optionalLabel ? (
          <span className="ml-1 font-normal text-ink-400">
            {optionalLabel}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function HelperOrError({
  id,
  helperText,
  error,
}: {
  id?: string;
  helperText?: string;
  error?: string;
}) {
  if (error) {
    return (
      <p id={id ? `${id}-error` : undefined} className="text-caption text-danger-600">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={id ? `${id}-helper` : undefined} className="text-caption text-ink-500">
        {helperText}
      </p>
    );
  }
  return null;
}

export function Input({
  id,
  label,
  helperText,
  error,
  optionalLabel,
  inputSize = "md",
  leading,
  trailing,
  required,
  className,
  ...props
}: InputProps) {
  const describedBy = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  const field = (
    <input
      id={id}
      required={required}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={describedBy}
      className={cn(
        "w-full rounded-sm border bg-ink-0 text-body text-ink-900 placeholder:text-ink-400",
        "border-ink-200 hover:border-ink-300",
        "focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400",
        sizeHeight[inputSize],
        leading ? "pl-10" : "pl-4",
        trailing ? "pr-10" : "pr-4",
        error && "border-danger-600 focus-visible:border-danger-600",
        className
      )}
      {...props}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <FieldLabel
          htmlFor={id}
          label={label}
          optionalLabel={optionalLabel}
          required={required}
        />
      ) : null}
      {leading || trailing ? (
        <div className="relative">
          {leading ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
              {leading}
            </span>
          ) : null}
          {field}
          {trailing ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500">
              {trailing}
            </span>
          ) : null}
        </div>
      ) : (
        field
      )}
      <HelperOrError id={id} helperText={helperText} error={error} />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  optionalLabel?: string;
  required?: boolean;
};

export function Textarea({
  id,
  label,
  helperText,
  error,
  optionalLabel,
  required,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const describedBy = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <FieldLabel
          htmlFor={id}
          label={label}
          optionalLabel={optionalLabel}
          required={required}
        />
      ) : null}
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-24 w-full resize-y rounded-sm border bg-ink-0 px-4 py-3 text-body text-ink-900 placeholder:text-ink-400",
          "border-ink-200 hover:border-ink-300",
          "focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400",
          error && "border-danger-600 focus-visible:border-danger-600",
          className
        )}
        {...props}
      />
      <HelperOrError id={id} helperText={helperText} error={error} />
    </div>
  );
}
