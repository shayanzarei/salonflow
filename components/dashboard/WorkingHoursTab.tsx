"use client";

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
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #f5f5f5",
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}>
          Working Hours
        </h3>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>
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
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
              style={{
                borderBottom: isLast ? "none" : "1px solid #f5f5f5",
                opacity: data.is_working ? 1 : 0.55,
                transition: "opacity 0.15s",
              }}
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
                  className="relative shrink-0 cursor-pointer border-none p-0 transition-colors"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: data.is_working ? brand : "#D1D5DB",
                    transition: "background 0.2s",
                  }}
                >
                  <span
                    className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all"
                    style={{
                      left: data.is_working ? 23 : 3,
                      transition: "left 0.2s",
                    }}
                  />
                </button>

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#1F2937",
                    userSelect: "none",
                  }}
                >
                  {d.label}
                </span>
              </div>

              {/* Time pickers or "Day off" */}
              {data.is_working ? (
                <div className="flex flex-wrap items-center gap-2 pl-[56px] sm:pl-0">
                  <select
                    value={data.start_time}
                    onChange={(e) => setTime(d.day, "start_time", e.target.value)}
                    className="min-h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
                    style={{ cursor: "pointer" }}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <span style={{ fontSize: 13, color: "#9CA3AF", flexShrink: 0 }}>
                    to
                  </span>

                  <select
                    value={data.end_time}
                    onChange={(e) => setTime(d.day, "end_time", e.target.value)}
                    className="min-h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
                    style={{ cursor: "pointer" }}
                  >
                    {TIME_OPTIONS.filter((t) => t.value > data.start_time).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span
                  className="pl-[56px] text-sm sm:pl-0"
                  style={{ color: "#9CA3AF" }}
                >
                  Day off
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <div className="text-sm">
          {error && <span style={{ color: "#EF4444" }}>{error}</span>}
          {saved && !error && (
            <span style={{ color: "#059669" }}>✓ Saved successfully</span>
          )}
          {!error && !saved && (
            <span style={{ color: "#9CA3AF" }}>
              Changes are applied to future bookings immediately.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex min-h-10 items-center justify-center rounded-[10px] px-5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
          style={{
            background: brand,
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save Working Hours"}
        </button>
      </div>
    </div>
  );
}
