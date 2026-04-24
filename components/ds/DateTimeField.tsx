import { cn } from "@/lib/cn";

export function DateTimeField({
  dateId,
  timeId,
  dateLabel = "Date",
  timeLabel = "Time",
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  minDate,
  required = false,
}: {
  dateId: string;
  timeId: string;
  dateLabel?: string;
  timeLabel?: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  minDate?: string;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <div>
        <label htmlFor={dateId} className="mb-1.5 block text-label font-medium text-ink-700">
          {dateLabel}
        </label>
        <input
          id={dateId}
          type="date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          required={required}
          min={minDate}
          className={cn(
            "min-h-11 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 text-body-sm text-ink-900",
            "hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
          )}
        />
      </div>
      <div>
        <label htmlFor={timeId} className="mb-1.5 block text-label font-medium text-ink-700">
          {timeLabel}
        </label>
        <input
          id={timeId}
          type="time"
          value={timeValue}
          onChange={(e) => onTimeChange(e.target.value)}
          required={required}
          className={cn(
            "min-h-11 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 text-body-sm text-ink-900",
            "hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
          )}
        />
      </div>
    </div>
  );
}
