"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, type ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-[480px]",
  md: "max-w-[640px]",
  lg: "max-w-[800px]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  hideCloseButton = false,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  hideCloseButton?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Esc closes; lock body scroll while open; return focus to trigger
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // Focus the dialog after paint
    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = title ? "ds-modal-title" : undefined;
  const descriptionId = description ? "ds-modal-description" : undefined;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink-950/50 backdrop-blur-[4px]",
          "[animation:ds-modal-fade_var(--duration-slow)_var(--ease-emphasized)]"
        )}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          "relative z-[1] w-full rounded-lg bg-ink-0 p-6 shadow-xl outline-none",
          "[animation:ds-modal-pop_var(--duration-slow)_var(--ease-emphasized)]",
          sizeClasses[size],
          className
        )}
      >
        {!hideCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-sm",
              "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
              "focus-visible:shadow-focus focus-visible:outline-none"
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
        {title ? (
          <h2
            id={titleId}
            className="mb-2 pr-10 text-h3 font-semibold tracking-tight text-ink-900"
          >
            {title}
          </h2>
        ) : null}
        {description ? (
          <p id={descriptionId} className="mb-5 text-body-sm text-ink-500">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      <style jsx>{`
        @keyframes ds-modal-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes ds-modal-pop {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
