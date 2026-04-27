"use client";

import type { BookingSection } from "@/lib/i18n/catalog/booking";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TimeSlot {
  value: string;
  label: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
  reason?: "booked" | "past";
}

export default function TimeSlotPicker({
  service,
  staff,
  brand,
  picker,
  localeTag,
}: {
  service: string;
  staff: string;
  brand: string;
  picker: BookingSection["timePicker"];
  localeTag: string;
}) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  // Fetch available slots whenever the date, service, or staff changes
  useEffect(() => {
    const controller = new AbortController();

    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotsError(false);
      setSelectedTime(null);
      setSlots([]);

      // Build YYYY-MM-DD from local date (matches what the user sees)
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      try {
        const res = await fetch(
          `/api/availability?serviceId=${service}&staffId=${staff}&date=${dateStr}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json() as {
          slots: {
            isoTime: string;
            label: string;
            period: string;
            available: boolean;
            reason?: "booked" | "past";
          }[];
        };
        setSlots(
          data.slots.map((s) => ({
            value: s.isoTime,
            label: s.label,
            period: s.period as TimeSlot["period"],
            available: s.available,
            reason: s.reason,
          }))
        );
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSlotsError(true);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => controller.abort();
  }, [selectedDate, service, staff]);

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    calendarDays.push(new Date(year, month, d));

  const morning = slots.filter((s) => s.period === "morning");
  const afternoon = slots.filter((s) => s.period === "afternoon");
  const evening = slots.filter((s) => s.period === "evening");

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();
  const isPast = (date: Date) => date < today;

  const selectedDateLabel = selectedDate.toLocaleDateString(localeTag, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleContinue() {
    if (!selectedTime) return;
    router.push(
      `/book/confirm?service=${service}&staff=${staff}&time=${selectedTime}`
    );
  }

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
        {/* Calendar */}
        <div className="rounded-[20px] border border-ink-100 bg-white p-4 sm:p-6 md:p-7">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#111",
              margin: "0 0 20px",
            }}
          >
            {picker.selectDate}
          </h3>

          {/* Month nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
              {currentMonth.toLocaleDateString(localeTag, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          </div>

          {/* Day labels */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: 8,
            }}
          >
            {picker.weekdayShort.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#aaa",
                  fontWeight: 500,
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {calendarDays.map((date, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                {date ? (
                  <button
                    type="button"
                    onClick={() => !isPast(date) && selectDate(date)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      border: "none",
                      background: isSelected(date)
                        ? brand
                        : isToday(date)
                          ? `${brand}15`
                          : "transparent",
                      color: isSelected(date)
                        ? "white"
                        : isPast(date)
                          ? "#ddd"
                          : isToday(date)
                            ? brand
                            : "#333",
                      fontSize: 13,
                      fontWeight: isSelected(date) || isToday(date) ? 600 : 400,
                      cursor: isPast(date) ? "not-allowed" : "pointer",
                      padding: "6px 0",
                    }}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink-100 pt-4">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{ width: 12, height: 12, borderRadius: "50%", background: brand }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>{picker.legendSelected}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: `${brand}15`,
                  border: `1px solid ${brand}`,
                }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>{picker.legendToday}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#FAFAFA",
                  border: "1px solid #F3F4F6",
                }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>
                {picker.legendUnavailable}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>{picker.legendBooked}</span>
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div className="rounded-[20px] border border-ink-100 bg-white p-4 sm:p-6 md:p-7">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {picker.availableTimes}
            </h3>
            <span
              className="text-sm font-medium sm:text-[13px]"
              style={{ color: brand }}
            >
              {selectedDateLabel}
            </span>
          </div>

          {/* Loading state */}
          {loadingSlots && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 0",
                gap: 12,
              }}
            >
              {/* Spinner */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke={brand}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                {picker.loadingAvailability}
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error state */}
          {!loadingSlots && slotsError && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#EF4444",
                fontSize: 14,
              }}
            >
              {picker.loadError}
            </div>
          )}

          {/* Empty state — no slots at all for this day */}
          {!loadingSlots && !slotsError && slots.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#aaa",
                fontSize: 14,
              }}
            >
              {picker.noSlots}
            </div>
          )}

          {/* Slot groups */}
          {!loadingSlots && !slotsError && slots.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: picker.morning, slots: morning },
                { label: picker.afternoon, slots: afternoon },
                { label: picker.evening, slots: evening },
              ]
                .filter((g) => g.slots.length > 0)
                .map((group) => (
                  <div key={group.label}>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        margin: "0 0 10px",
                      }}
                    >
                      {group.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {group.slots.map((slot) => {
                        const isSelected = selectedTime === slot.value;
                        const isBooked = !slot.available && slot.reason === "booked";
                        const isPastSlot = !slot.available && slot.reason === "past";
                        const isDisabled = !slot.available;

                        return (
                          <button
                            type="button"
                            key={slot.value}
                            disabled={isDisabled}
                            onClick={() =>
                              slot.available && setSelectedTime(slot.value)
                            }
                            title={
                              isBooked
                                ? picker.titleBooked
                                : isPastSlot
                                  ? picker.titlePast
                                  : undefined
                            }
                            className="relative min-h-11 rounded-[10px] px-1 py-2.5 text-xs sm:text-[13px]"
                            style={{
                              border: isSelected
                                ? `2px solid ${brand}`
                                : isDisabled
                                  ? "1px solid #F3F4F6"
                                  : "1px solid #e5e7eb",
                              background: isSelected
                                ? `${brand}10`
                                : isDisabled
                                  ? "#FAFAFA"
                                  : "white",
                              color: isSelected
                                ? brand
                                : isDisabled
                                  ? "#C4C4C4"
                                  : "#333",
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              fontWeight: isSelected ? 600 : 400,
                              transition: "all 0.1s",
                              textDecoration: isDisabled
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {slot.label}
                            {/* "Booked" badge */}
                            {isBooked && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 9,
                                  fontWeight: 600,
                                  color: "#E5A300",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                  textDecoration: "none",
                                  lineHeight: 1,
                                  marginTop: 2,
                                }}
                              >
                                {picker.bookedBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-8 px-1 text-center sm:mt-10">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedTime}
          className="w-full max-w-md rounded-full px-6 py-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed sm:inline-block sm:w-auto sm:min-w-[280px] sm:px-10 sm:text-[15px]"
          style={{
            background: selectedTime ? brand : "#e5e7eb",
            color: selectedTime ? "white" : "#aaa",
            border: "none",
            cursor: selectedTime ? "pointer" : "not-allowed",
          }}
        >
          {picker.continueCta}
        </button>
      </div>
    </div>
  );
}
