import { fillTemplate } from "@/lib/i18n/interpolate";
import type { BookingSection } from "@/lib/i18n/catalog/booking";

type ProgressLabels = BookingSection["progress"];

export default function BookingProgress({
  step,
  brand,
  variant = "default",
  progressLabels,
}: {
  step: number;
  brand: string;
  variant?: "default" | "complete";
  progressLabels: ProgressLabels;
}) {
  const steps = [
    { num: 1, label: progressLabels.service },
    { num: 2, label: progressLabels.staff },
    { num: 3, label: progressLabels.time },
    { num: 4, label: progressLabels.confirm },
  ];

  const effectiveStep = variant === "complete" ? steps.length + 1 : step;

  return (
    <div className="-mx-1 mb-8 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:mx-0 sm:mb-10 sm:overflow-visible sm:px-0 sm:pb-0 md:mb-12">
      <div className="flex min-w-max items-center justify-center gap-0 sm:min-w-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9 sm:text-[13px]"
                style={{
                  background: s.num < effectiveStep ? brand : "#f0f0f0",
                  color: s.num < effectiveStep ? "white" : "#999",
                }}
              >
                {s.num < effectiveStep ? "✓" : s.num}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  variant === "complete"
                    ? "font-medium text-gray-800"
                    : s.num === step
                      ? "font-semibold text-gray-900"
                      : "font-normal text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mx-2 h-px w-6 shrink-0 sm:mx-3 sm:w-10 md:w-[52px]"
                style={{
                  background: s.num < effectiveStep ? `${brand}40` : "#e5e7eb",
                }}
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs font-medium text-gray-600 sm:hidden">
        {variant === "complete"
          ? progressLabels.allCompleteMobile
          : fillTemplate(progressLabels.stepMobile, {
              step,
              total: steps.length,
              label: steps.find((x) => x.num === step)?.label ?? "",
            })}
      </p>
    </div>
  );
}
