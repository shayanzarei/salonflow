"use client";

import { useState } from "react";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  booked_at: string;
  service_name: string;
  duration_mins: number;
  price: number;
  staff_name: string;
  staff_id: string;
  status: string;
}

export default function StaffCalendarGrid({
  bookings,
  brandColor,
}: {
  bookings: Booking[];
  brandColor: string;
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const today = new Date();
  const now = new Date();

  const filteredBookings = searchQuery.trim()
    ? bookings.filter(
        (b) =>
          b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookings;

  function getBookingsForDayAndHour(day: Date, hour: number) {
    return filteredBookings.filter((b) => {
      const bookedAt = new Date(b.booked_at);
      return (
        bookedAt.toDateString() === day.toDateString() &&
        bookedAt.getHours() === hour
      );
    });
  }

  function getBookingHeight(durationMins: number) {
    return (durationMins / 60) * 64;
  }

  const currentTimePercent =
    (((now.getHours() - 8) * 60 + now.getMinutes()) / (13 * 60)) * 100;
  const showTimeLine = now.getHours() >= 8 && now.getHours() <= 20;

  function prevWeek() {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  }

  function nextWeek() {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  }

  function goToToday() {
    const n = new Date();
    const day = n.getDay();
    const diff = n.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(n);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }

  return (
    <div className="min-w-0">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-[220px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none"
          />
        </div>

        {/* Week nav + Today */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={prevWeek}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-gray-900"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-sm font-semibold text-gray-900">
            {currentWeekStart.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-gray-900"
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="shrink-0 rounded-full border-[1.5px] bg-white px-4 py-2 text-sm font-semibold"
            style={{ borderColor: brandColor, color: brandColor }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "56px repeat(7, 1fr)",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div style={{ padding: "16px 8px" }} />
              {weekDays.map((day) => {
                const isToday = day.toDateString() === today.toDateString();
                return (
                  <div
                    key={day.toISOString()}
                    style={{
                      padding: "16px 8px",
                      textAlign: "center",
                      borderLeft: "1px solid #f5f5f5",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: isToday ? brandColor : "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        margin: "0 0 6px",
                      }}
                    >
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: isToday ? brandColor : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: isToday ? "white" : "#111",
                        }}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div style={{ position: "relative", overflowY: "auto", maxHeight: 680 }}>
              {/* Current time line */}
              {showTimeLine && (
                <div
                  style={{
                    position: "absolute",
                    top: `${currentTimePercent}%`,
                    left: 56,
                    right: 0,
                    height: 2,
                    background: "#EF4444",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#EF4444",
                      position: "absolute",
                      left: -5,
                      top: -4,
                    }}
                  />
                </div>
              )}

              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px repeat(7, 1fr)",
                    height: 64,
                    borderBottom: "1px solid #f9f9f9",
                  }}
                >
                  {/* Hour label */}
                  <div
                    style={{
                      padding: "0 10px 0 0",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "flex-end",
                      paddingTop: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#bbb", fontWeight: 500 }}>
                      {hour === 12
                        ? "12 PM"
                        : hour > 12
                          ? `${hour - 12} PM`
                          : `${hour} AM`}
                    </span>
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const isToday = day.toDateString() === today.toDateString();
                    const dayBookings = getBookingsForDayAndHour(day, hour);

                    return (
                      <div
                        key={day.toISOString()}
                        style={{
                          borderLeft: "1px solid #f5f5f5",
                          position: "relative",
                          background: isToday ? `${brandColor}05` : "transparent",
                          padding: "2px 3px",
                        }}
                      >
                        {dayBookings.map((booking) => {
                          const height = getBookingHeight(booking.duration_mins);
                          const startMinutes = new Date(booking.booked_at).getMinutes();
                          const topOffset = (startMinutes / 60) * 64;

                          return (
                            <button
                              key={booking.id}
                              onClick={() => setSelectedBooking(booking)}
                              style={{
                                position: "absolute",
                                top: topOffset + 2,
                                left: 3,
                                right: 3,
                                height: Math.max(height - 4, 28),
                                background: brandColor,
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                padding: "6px 8px",
                                overflow: "hidden",
                                zIndex: 5,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "white",
                                  margin: 0,
                                  lineHeight: 1.3,
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {booking.client_name}
                              </p>
                              {height > 40 && (
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.85)",
                                    margin: "2px 0 0",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {booking.service_name}
                                </p>
                              )}
                              {height > 56 && (
                                <p
                                  style={{
                                    fontSize: 10,
                                    color: "rgba(255,255,255,0.75)",
                                    margin: "2px 0 0",
                                  }}
                                >
                                  🕐{" "}
                                  {new Date(booking.booked_at).toLocaleTimeString(
                                    "en-US",
                                    { hour: "numeric", minute: "2-digit" }
                                  )}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              maxWidth: 400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0 }}>
                Appointment Details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#aaa",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Client */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: brandColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {selectedBooking.client_name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}>
                  {selectedBooking.client_name}
                </p>
                <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                  {selectedBooking.client_email}
                </p>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "✂", label: "Service", value: selectedBooking.service_name },
                {
                  icon: "📅",
                  label: "Date",
                  value: new Date(selectedBooking.booked_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }),
                },
                {
                  icon: "🕐",
                  label: "Time",
                  value: new Date(selectedBooking.booked_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                },
                {
                  icon: "⏱",
                  label: "Duration",
                  value: `${selectedBooking.duration_mins} mins`,
                },
                {
                  icon: "💶",
                  label: "Price",
                  value: `€${selectedBooking.price}`,
                  colored: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#888",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: (item as { colored?: boolean }).colored ? brandColor : "#111",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
