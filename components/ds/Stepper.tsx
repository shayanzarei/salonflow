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
    <div
      role="list"
      aria-label="Progress"
      className={cn(
        "flex min-w-max items-center justify-center gap-0 sm:min-w-0",
        className
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < effectiveStep;
        const isCurrent = !complete && stepNumber === currentStep;

        return (
          <div
            key={step.label}
            role="listitem"
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-center"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold sm:h-9 sm:w-9 sm:text-[13px]",
                  "[transition-duration:var(--duration-base)] [transition-timing-function:var(--ease-standard)] transition-[background-color,border-color,color]",
                  done && "border-brand-600 bg-brand-600 text-white",
                  isCurrent && "border-brand-600 bg-ink-0 text-brand-600",
                  !done && !isCurrent && "border-ink-200 bg-ink-0 text-ink-500"
                )}
              >
                {done ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <path
                      d="m5 10 3.5 3.5L15 6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "hidden text-body-sm sm:inline",
                  done && "font-medium text-ink-700",
                  isCurrent && "font-semibold text-ink-900",
                  !done && !isCurrent && "font-normal text-ink-500"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-2 h-0.5 w-6 shrink-0 sm:mx-3 sm:w-10 md:w-[52px]",
                  done ? "bg-brand-600" : "bg-ink-200"
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
