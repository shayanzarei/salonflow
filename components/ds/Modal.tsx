"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(12,10,9,0.5)] backdrop-blur-[4px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-[1] w-full max-w-[640px] rounded-lg bg-ink-0 p-6 shadow-xl",
          className
        )}
      >
        {title ? <h2 className="mb-4 text-h3 font-semibold text-ink-900">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
