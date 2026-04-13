export default function BookingProgress({
  step,
  brand,
}: {
  step: number;
  brand: string;
}) {
  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Staff" },
    { num: 3, label: "Time" },
    { num: 4, label: "Confirm" },
  ];

  return (
    <div className="-mx-1 mb-8 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:mx-0 sm:mb-10 sm:overflow-visible sm:px-0 sm:pb-0 md:mb-12">
      <div className="flex min-w-max items-center justify-center gap-0 sm:min-w-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9 sm:text-[13px]"
                style={{
                  background: s.num <= step ? brand : "#f0f0f0",
                  color: s.num <= step ? "white" : "#999",
                }}
              >
                {s.num < step ? "✓" : s.num}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  s.num === step ? "font-semibold text-gray-900" : "font-normal text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mx-2 h-px w-6 shrink-0 bg-gray-200 sm:mx-3 sm:w-10 md:w-[52px]"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
      {/* Mobile-only current step label */}
      <p className="mt-2 text-center text-xs font-medium text-gray-600 sm:hidden">
        Step {step} of {steps.length}: {steps.find((x) => x.num === step)?.label}
      </p>
    </div>
  );
}
