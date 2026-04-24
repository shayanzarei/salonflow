"use client";

import { cn } from "@/lib/cn";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "info" | "success" | "warning" | "danger";
type ToastItem = { id: number; message: string; tone: ToastTone };

const tones: Record<ToastTone, string> = {
  info: "border-info-600 bg-info-50 text-info-600",
  success: "border-success-600 bg-success-50 text-success-700",
  warning: "border-warning-600 bg-warning-50 text-warning-700",
  danger: "border-danger-600 bg-danger-50 text-danger-700",
};

const ToastContext = createContext<{
  showToast: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, tone === "warning" ? 8000 : 5000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-toast flex w-full max-w-[380px] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              "pointer-events-auto rounded-md border-l-[3px] px-4 py-3 text-body-sm shadow-lg",
              tones[toast.tone]
            )}
          >
            {toast.message}
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
