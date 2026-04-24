import { cn } from "@/lib/cn";

type StepItem = { label: string };

export function Stepper({
  steps,
  currentStep,
  complete = false,
  className,
}: {
  steps: StepItem[];
  currentStep: number;
  complete?: boolean;
  className?: string;
}) {
  const effectiveStep = complete ? steps.length + 1 : currentStep;

  return (
    <div className={cn("flex min-w-max items-center justify-center gap-0 sm:min-w-0", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < effectiveStep;
        const isCurrent = !complete && stepNumber === currentStep;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9 sm:text-[13px]",
                  done ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
                )}
              >
                {done ? "✓" : stepNumber}
              </div>
              <span
                className={cn(
                  "hidden text-body-sm sm:inline",
                  complete
                    ? "font-medium text-ink-700"
                    : isCurrent
                      ? "font-semibold text-ink-900"
                      : "font-normal text-ink-500"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-2 h-px w-6 shrink-0 sm:mx-3 sm:w-10 md:w-[52px]",
                  done ? "bg-brand-200" : "bg-ink-200"
                )}
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
