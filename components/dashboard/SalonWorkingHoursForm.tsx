"use client";

import { Button } from "@/components/ds/Button";
import { Select } from "@/components/ds/Select";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
  { day: 0, label: "Sunday" },
] as const;

type DayHours = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
};

function buildTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute === 30) break;
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const label = new Date(`2000-01-01T${value}:00`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();
const DEFAULT_DAY = { start_time: "09:00", end_time: "17:00", is_working: false };

export default function SalonWorkingHoursForm({
  brand,
  initialHours,
  redirectTo = "",
}: {
  brand: string;
  initialHours: DayHours[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const [hours, setHours] = useState<
    Record<number, Omit<DayHours, "day_of_week">>
  >(() => {
    const map: Record<number, Omit<DayHours, "day_of_week">> = {};
    for (const day of DAYS) {
      const existing = initialHours.find((item) => item.day_of_week === day.day);
      map[day.day] = existing
        ? {
            start_time: String(existing.start_time).slice(0, 5),
            end_time: String(existing.end_time).slice(0, 5),
            is_working: existing.is_working,
          }
        : { ...DEFAULT_DAY };
    }
    return map;
  });
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

  function setTime(day: number, field: "start_time" | "end_time", value: string) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const payload = DAYS.map((day) => ({
        day_of_week: day.day,
        ...hours[day.day],
      }));

      const response = await fetch("/api/settings/opening-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: payload, redirect_to: redirectTo }),
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(json.error ?? "Save failed");
      }

      setSaved(true);
      if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        router.push(redirectTo);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-ink-0">
      <div className="border-b border-ink-100 px-5 py-4">
        <h2 className="text-body font-semibold text-ink-900">Working Hours</h2>
        <p className="mt-1 text-body-sm text-ink-500">
          Toggle each day on/off and set working hours. Customers can only book
          within these times.
        </p>
      </div>

      <div>
        {DAYS.map((day, index) => {
          const item = hours[day.day];
          const isLast = index === DAYS.length - 1;
          return (
            <div
              key={day.day}
              className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${
                isLast ? "" : "border-b border-ink-100"
              } ${item.is_working ? "" : "opacity-55"} transition-opacity`}
            >
              <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.is_working}
                  aria-label={`${day.label} working`}
                  onClick={() => toggle(day.day)}
                  className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-none p-0 transition-colors"
                  style={{
                    background: item.is_working ? brand : "var(--color-ink-300, #D1D5DB)",
                  }}
                >
                  <span
                    className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-ink-0 shadow-sm transition-all"
                    style={{ left: item.is_working ? 23 : 3 }}
                  />
                </button>
                <span className="select-none text-body-sm font-medium text-ink-900">
                  {day.label}
                </span>
              </div>

              {item.is_working ? (
                <div className="flex flex-wrap items-center gap-2 pl-[56px] sm:pl-0">
                  <Select
                    id={`salon-start-${day.day}`}
                    value={item.start_time}
                    onChange={(e) => setTime(day.day, "start_time", e.target.value)}
                    className="cursor-pointer"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </Select>
                  <span className="shrink-0 text-body-sm text-ink-400">to</span>
                  <Select
                    id={`salon-end-${day.day}`}
                    value={item.end_time}
                    onChange={(e) => setTime(day.day, "end_time", e.target.value)}
                    className="cursor-pointer"
                  >
                    {TIME_OPTIONS.filter(
                      (time) => time.value > item.start_time
                    ).map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
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

      <div className="flex flex-col gap-3 border-t border-ink-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="text-body-sm">
          {error && <span className="text-danger-600">{error}</span>}
          {saved && !error && (
            <span className="text-success-700">Saved successfully</span>
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
          {saving ? "Saving..." : "Save Working Hours"}
        </Button>
      </div>
    </div>
  );
}
