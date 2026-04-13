"use client";

import Link from "next/link";
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

interface Staff {
  id: string;
  name: string;
}

const STAFF_COLORS = [
  "#7C3AED",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
];

export default function CalendarView({
  bookings,
  staff,
  brandColor,
}: {
  bookings: Booking[];
  staff: Staff[];
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
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");

  const staffColorMap: Record<string, string> = {};
  staff.forEach((s, i) => {
    staffColorMap[s.id] = STAFF_COLORS[i % STAFF_COLORS.length];
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const today = new Date();
  const now = new Date();

  const filteredBookings =
    selectedStaffId === "all"
      ? bookings
      : bookings.filter((b) => b.staff_id === selectedStaffId);

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
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">Your weekly schedule</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: "#aaa",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search clients..."
              style={{
                paddingLeft: 36,
                paddingRight: 16,
                paddingTop: 9,
                paddingBottom: 9,
                border: "1px solid #e5e7eb",
                borderRadius: 100,
                fontSize: 14,
                color: "#111",
                background: "white",
                outline: "none",
                width: 200,
              }}
            />
          </div>

          {/* Week nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={prevWeek}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                color: "#111",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                minWidth: 100,
                textAlign: "center",
              }}
            >
              {currentWeekStart.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={nextWeek}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                color: "#111",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ›
            </button>
          </div>

          <button
            onClick={goToToday}
            style={{
              padding: "8px 20px",
              border: `1.5px solid ${brandColor}`,
              borderRadius: 100,
              background: "white",
              color: brandColor,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          overflow: "hidden",
        }}
      >
        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(7, 1fr)",
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
                    width: 36,
                    height: 36,
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
                      fontSize: 16,
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
        <div
          style={{ position: "relative", overflowY: "auto", maxHeight: 700 }}
        >
          {/* Current time line */}
          {showTimeLine && (
            <div
              style={{
                position: "absolute",
                top: `${currentTimePercent}%`,
                left: 60,
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
                gridTemplateColumns: "60px repeat(7, 1fr)",
                height: 64,
                borderBottom: "1px solid #f9f9f9",
              }}
            >
              {/* Hour label */}
              <div
                style={{
                  padding: "0 12px 0 0",
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
                      const color =
                        staffColorMap[booking.staff_id] ?? brandColor;
                      const height = getBookingHeight(booking.duration_mins);
                      const startMinutes = new Date(
                        booking.booked_at
                      ).getMinutes();
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
                            background: color,
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

        {/* Staff legend + filter */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #f5f5f5",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Staff:
          </span>

          {/* All filter */}
          <button
            onClick={() => setSelectedStaffId("all")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 100,
              border: "none",
              cursor: "pointer",
              background: selectedStaffId === "all" ? "#111" : "transparent",
              color: selectedStaffId === "all" ? "white" : "#666",
              fontSize: 13,
              fontWeight: selectedStaffId === "all" ? 600 : 400,
            }}
          >
            All
          </button>

          {staff.map((member, i) => {
            const color = STAFF_COLORS[i % STAFF_COLORS.length];
            const isActive = selectedStaffId === member.id;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedStaffId(isActive ? "all" : member.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 100,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? `${color}20` : "transparent",
                  color: isActive ? color : "#555",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                  }}
                />
                {member.name}
              </button>
            );
          })}
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
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                }}
              >
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
                  background:
                    staffColorMap[selectedBooking.staff_id] ?? brandColor,
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
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  {selectedBooking.client_name}
                </p>
                <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                  {selectedBooking.client_email}
                </p>
              </div>
            </div>

            {/* Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  icon: "✂",
                  label: "Service",
                  value: selectedBooking.service_name,
                },
                {
                  icon: "👤",
                  label: "Staff",
                  value: selectedBooking.staff_name,
                },
                {
                  icon: "📅",
                  label: "Date",
                  value: new Date(selectedBooking.booked_at).toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  ),
                },
                {
                  icon: "🕐",
                  label: "Time",
                  value: new Date(selectedBooking.booked_at).toLocaleTimeString(
                    "en-US",
                    { hour: "numeric", minute: "2-digit" }
                  ),
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
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
                      color: (item as any).colored ? brandColor : "#111",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={`/bookings/${selectedBooking.id}`}
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 500,
                color: brandColor,
                textDecoration: "none",
                padding: "10px",
                border: `1px solid ${brandColor}30`,
                borderRadius: 10,
                background: `${brandColor}08`,
              }}
            >
              View Full Details →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
