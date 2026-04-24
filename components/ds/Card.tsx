import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-ink-0 p-6",
        interactive
          ? "border border-ink-200 shadow-sm transition-shadow hover:shadow-md"
          : "border border-ink-200",
        className
      )}
      {...props}
    />
  );
}
