"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface TimeSlot {
  value: string;
  label: string;
  period: "morning" | "afternoon" | "evening";
}

function generateSlotsForDate(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();

  for (let h = 9; h < 20; h++) {
    for (const m of [0, 30]) {
      const slotDate = new Date(date);
      slotDate.setHours(h, m, 0, 0);
      if (slotDate <= now) continue;

      const label = slotDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      const period: TimeSlot["period"] =
        h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";

      slots.push({ value: slotDate.toISOString(), label, period });
    }
  }
  return slots;
}

export default function TimeSlotPicker({
  service,
  staff,
  brand,
}: {
  service: string;
  staff: string;
  brand: string;
}) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    calendarDays.push(new Date(year, month, d));

  const slots = generateSlotsForDate(selectedDate);
  const morning = slots.filter((s) => s.period === "morning");
  const afternoon = slots.filter((s) => s.period === "afternoon");
  const evening = slots.filter((s) => s.period === "evening");

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

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

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();
  const isPast = (date: Date) => date < today;

  const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Calendar */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: 20,
            padding: 28,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#111",
              margin: "0 0 20px",
            }}
          >
            Select a date
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
              onClick={prevMonth}
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
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={nextMonth}
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
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
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
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #f5f5f5",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: brand,
                }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>Selected</span>
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
              <span style={{ fontSize: 12, color: "#888" }}>Today</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#f0f0f0",
                }}
              />
              <span style={{ fontSize: 12, color: "#888" }}>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: 20,
            padding: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              Available times
            </h3>
            <span style={{ fontSize: 13, color: brand, fontWeight: 500 }}>
              {selectedDateLabel}
            </span>
          </div>

          {slots.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#aaa",
                fontSize: 14,
              }}
            >
              No available slots for this date
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Morning", slots: morning },
                { label: "Afternoon", slots: afternoon },
                { label: "Evening", slots: evening },
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
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                      }}
                    >
                      {group.slots.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => setSelectedTime(slot.value)}
                          style={{
                            padding: "10px 8px",
                            borderRadius: 10,
                            border:
                              selectedTime === slot.value
                                ? `2px solid ${brand}`
                                : "1px solid #e5e7eb",
                            background:
                              selectedTime === slot.value
                                ? `${brand}10`
                                : "white",
                            color: selectedTime === slot.value ? brand : "#333",
                            fontSize: 13,
                            fontWeight: selectedTime === slot.value ? 600 : 400,
                            cursor: "pointer",
                          }}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <button
          onClick={handleContinue}
          disabled={!selectedTime}
          style={{
            padding: "16px 60px",
            background: selectedTime ? brand : "#e5e7eb",
            color: selectedTime ? "white" : "#aaa",
            border: "none",
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 600,
            cursor: selectedTime ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          Continue to Confirmation →
        </button>
      </div>
    </div>
  );
}
