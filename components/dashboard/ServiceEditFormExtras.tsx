"use client";

import { useEffect, useState, type ReactNode } from "react";

const DURATION_PILLS = [30, 45, 60, 90, 120];

export function ServiceDurationField({
  initial,
  brand,
  quickSelectionTitle = "Quick select",
  pillSuffix = " min",
  required: fieldRequired = true,
  onMinutesChangeAction,
  labelText = "Duration (min)",
  inputSuffix,
  borderedRow = false,
}: {
  initial: number;
  brand: string;
  quickSelectionTitle?: string | null;
  pillSuffix?: string;
  required?: boolean;
  onMinutesChangeAction?: (minutes: number) => void;
  /** Pass `null` to hide the label (parent supplies its own). */
  labelText?: string | null;
  inputSuffix?: ReactNode;
  /** Wrap the number input (+ optional suffix) in a single bordered row. */
  borderedRow?: boolean;
}) {
  const [mins, setMins] = useState(initial);

  useEffect(() => {
    onMinutesChangeAction?.(mins);
  }, [mins, onMinutesChangeAction]);

  const numberInput = (
    <input
      type="number"
      min={5}
      step={5}
      required={fieldRequired}
      value={mins}
      onChange={(e) => setMins(parseInt(e.target.value, 10) || 0)}
      className={
        borderedRow
          ? "min-h-10 min-w-0 flex-1 border-none bg-transparent px-3 py-2.5 text-body-sm text-ink-900 outline-none"
          : "min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 py-2.5 text-body-sm text-ink-900 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
      }
    />
  );

  return (
    <div>
      {labelText ? (
        <label className="mb-2 block text-caption font-semibold uppercase tracking-wider text-ink-400">
          {labelText}
        </label>
      ) : null}
      <input type="hidden" name="duration_mins" value={mins} />
      {borderedRow ? (
        <div className="flex items-center overflow-hidden rounded-sm border border-ink-200 bg-ink-0 focus-within:border-brand-600 focus-within:shadow-focus">
          {numberInput}
          {inputSuffix != null ? (
            <span className="whitespace-nowrap px-3 text-body-sm font-medium text-ink-500">
              {inputSuffix}
            </span>
          ) : null}
        </div>
      ) : (
        numberInput
      )}
      {quickSelectionTitle ? (
        <>
          <p className="mb-2 mt-3 text-caption font-semibold uppercase tracking-wider text-ink-400">
            {quickSelectionTitle}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_PILLS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setMins(d)}
                className="cursor-pointer rounded-full px-3.5 py-1.5 text-caption font-medium"
                style={{
                  background: mins === d ? brand : "var(--color-ink-0)",
                  color: mins === d ? "white" : "var(--color-ink-600)",
                  border:
                    mins === d ? `2px solid ${brand}` : "1px solid var(--color-ink-200)",
                }}
              >
                {d}
                {pillSuffix}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ServiceActiveToggle({
  initial,
  brand,
  title = "Active status",
  subtitle = "Service visible to clients",
  onActiveChangeAction,
}: {
  initial: boolean;
  brand: string;
  title?: string;
  subtitle?: string;
  onActiveChangeAction?: (active: boolean) => void;
}) {
  const [on, setOn] = useState(initial);

  useEffect(() => {
    onActiveChangeAction?.(on);
  }, [on, onActiveChangeAction]);

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <div>
        <p className="mb-0.5 text-body-sm font-semibold text-ink-900">
          {title}
        </p>
        <p className="text-caption text-ink-500">{subtitle}</p>
      </div>
      <input type="hidden" name="is_active" value={on ? "true" : "false"} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-none p-0 transition-colors"
        style={{
          background: on ? brand : "var(--color-ink-200)",
        }}
      >
        <span
          className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-ink-0 shadow-sm transition-all"
          style={{ left: on ? 24 : 3 }}
        />
      </button>
    </div>
  );
}
