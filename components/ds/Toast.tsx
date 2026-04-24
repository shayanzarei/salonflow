"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "info" | "success" | "warning" | "danger";
type ToastItem = { id: number; message: string; tone: ToastTone };

const MAX_VISIBLE = 3;

const toneClasses: Record<ToastTone, string> = {
  info: "border-info-600 bg-info-50 text-info-600",
  success: "border-success-600 bg-success-50 text-success-700",
  warning: "border-warning-600 bg-warning-50 text-warning-700",
  danger: "border-danger-600 bg-danger-50 text-danger-700",
};

const toneIcons: Record<ToastTone, ReactNode> = {
  info: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 9v5M10 6.5v.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="m6.5 10 2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M10 2 2 17h16L10 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M10 8v4M10 14.5v.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="m7 7 6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
};

const autoDismissMs: Record<ToastTone, number | null> = {
  info: 5000,
  success: 5000,
  warning: 8000,
  danger: null, // persist until user dismisses
};

const ToastContext = createContext<{
  showToast: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => {
        const next = [...prev, { id, message, tone }];
        // Cap queue at MAX_VISIBLE; drop the oldest
        return next.length > MAX_VISIBLE
          ? next.slice(next.length - MAX_VISIBLE)
          : next;
      });

      const ttl = autoDismissMs[tone];
      if (ttl !== null) {
        const timer = window.setTimeout(() => dismiss(id), ttl);
        timers.current.set(id, timer);
      }
    },
    [dismiss]
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    const snapshot = timers.current;
    return () => {
      snapshot.forEach((timer) => window.clearTimeout(timer));
      snapshot.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-4 z-toast flex w-full max-w-[380px] flex-col gap-2 sm:max-w-[380px]"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "danger" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-md border-l-[3px] bg-ink-0 px-4 py-3 text-body-sm shadow-lg",
              toneClasses[toast.tone]
            )}
          >
            <span className="mt-0.5 shrink-0">{toneIcons[toast.tone]}</span>
            <span className="flex-1 text-ink-900">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900 focus-visible:shadow-focus focus-visible:outline-none"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
