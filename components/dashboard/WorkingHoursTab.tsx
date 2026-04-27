"use client";

import { Button } from "@/components/ds/Button";
import { Select } from "@/components/ds/Select";
import { useState } from "react";

const DAYS = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
  { day: 0, label: "Sunday" },
] as const;

export interface DayHours {
  day_of_week: number;
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM"
  is_working: boolean;
}

// 06:00 → 22:00 in 30-min steps
function buildTimeOptions() {
  const opts: { value: string; label: string }[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const label = new Date(`2000-01-01T${value}:00`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      opts.push({ value, label });
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

const DEFAULT_DAY: Omit<DayHours, "day_of_week"> = {
  start_time: "09:00",
  end_time: "17:00",
  is_working: false,
};

export default function WorkingHoursTab({
  staffId,
  brand,
  initialHours,
}: {
  staffId: string;
  brand: string;
  initialHours: DayHours[];
}) {
  // Build a map keyed by day_of_week
  const [hours, setHours] = useState<Record<number, Omit<DayHours, "day_of_week">>>(
    () => {
      const map: Record<number, Omit<DayHours, "day_of_week">> = {};
      for (const d of DAYS) {
        const existing = initialHours.find((h) => h.day_of_week === d.day);
        map[d.day] = existing
          ? {
              start_time: (existing.start_time as string).slice(0, 5),
              end_time: (existing.end_time as string).slice(0, 5),
              is_working: existing.is_working,
            }
          : { ...DEFAULT_DAY };
      }
      return map;
    }
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(day: number) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], is_working: !prev[day].is_working },
    }));
    setSaved(false);
  }

  function setTime(day: number, field: "start_time" | "end_time", val: string) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: val } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = DAYS.map((d) => ({
        day_of_week: d.day,
        ...hours[d.day],
      }));
      const res = await fetch("/api/staff/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, hours: payload }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Save failed");
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-ink-0">
      {/* Header */}
      <div className="border-b border-ink-100 px-5 py-4">
        <h3 className="text-body font-semibold text-ink-900">Working Hours</h3>
        <p className="mt-1 text-body-sm text-ink-500">
          Toggle each day on/off and set working hours. Customers can only book within these times.
        </p>
      </div>

      {/* Day rows */}
      <div>
        {DAYS.map((d, i) => {
          const data = hours[d.day];
          const isLast = i === DAYS.length - 1;

          return (
            <div
              key={d.day}
              className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${
                isLast ? "" : "border-b border-ink-100"
              } ${data.is_working ? "" : "opacity-55"} transition-opacity`}
            >
              {/* Toggle + day label */}
              <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.is_working}
                  aria-label={`${d.label} working`}
                  onClick={() => toggle(d.day)}
                  className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-none p-0 transition-colors"
                  style={{
                    background: data.is_working ? brand : "var(--color-ink-300, #D1D5DB)",
                  }}
                >
                  <span
                    className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-ink-0 shadow-sm transition-all"
                    style={{ left: data.is_working ? 23 : 3 }}
                  />
                </button>

                <span className="select-none text-body-sm font-medium text-ink-900">
                  {d.label}
                </span>
              </div>

              {/* Time pickers or "Day off" */}
              {data.is_working ? (
                <div className="flex flex-wrap items-center gap-2 pl-[56px] sm:pl-0">
                  <Select
                    id={`start-${d.day}`}
                    value={data.start_time}
                    onChange={(e) => setTime(d.day, "start_time", e.target.value)}
                    className="cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>

                  <span className="shrink-0 text-body-sm text-ink-400">to</span>

                  <Select
                    id={`end-${d.day}`}
                    value={data.end_time}
                    onChange={(e) => setTime(d.day, "end_time", e.target.value)}
                    className="cursor-pointer"
                  >
                    {TIME_OPTIONS.filter((t) => t.value > data.start_time).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <span className="pl-[56px] text-body-sm text-ink-400 sm:pl-0">
                  Day off
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-ink-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="text-body-sm">
          {error && <span className="text-danger-600">{error}</span>}
          {saved && !error && (
            <span className="text-success-700">✓ Saved successfully</span>
          )}
          {!error && !saved && (
            <span className="text-ink-400">
              Changes are applied to future bookings immediately.
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          variant="primary"
          size="md"
          className="sm:shrink-0"
          style={{ backgroundColor: brand }}
        >
          {saving ? "Saving…" : "Save Working Hours"}
        </Button>
      </div>
    </div>
  );
}
