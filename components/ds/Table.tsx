import { cn } from "@/lib/cn";
import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export function TableContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-ink-200 bg-ink-0",
        className
      )}
      {...props}
    />
  );
}

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left", className)}
      {...props}
    />
  );
}

export function THeadRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b border-ink-200 bg-ink-50", className)}
      {...props}
    />
  );
}

type TBodyRowProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
  /** Enables hover highlight. Defaults to true. */
  interactive?: boolean;
};

export function TBodyRow({
  className,
  selected = false,
  interactive = true,
  ...props
}: TBodyRowProps) {
  return (
    <tr
      aria-selected={selected || undefined}
      className={cn(
        "border-b border-ink-100 last:border-b-0",
        "[transition-duration:var(--duration-fast)] [transition-timing-function:var(--ease-standard)] transition-colors",
        interactive && "hover:bg-ink-50",
        selected &&
          "bg-brand-50 shadow-[inset_3px_0_0_0_var(--color-brand-600)]",
        className
      )}
      {...props}
    />
  );
}

export function TH({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-overline font-semibold uppercase tracking-[0.08em] text-ink-500",
        className
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-4 text-body-sm text-ink-900", className)}
      {...props}
    />
  );
}

/** Mono numeric cell — use for times and prices (spec §4.6). */
export function TDNumeric({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-4 font-mono text-body-sm text-ink-900 tabular-nums",
        className
      )}
      {...props}
    />
  );
}
