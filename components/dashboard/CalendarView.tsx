"use client";

import { useState } from "react";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
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
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  // hours to show (8am - 7pm)
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

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

  function getBookingsForDayAndHour(day: Date, hour: number) {
    return bookings.filter((b) => {
      const bookedAt = new Date(b.booked_at);
      return (
        bookedAt.toDateString() === day.toDateString() &&
        bookedAt.getHours() === hour
      );
    });
  }

  const today = new Date();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            ←
          </button>
          <h2 className="text-sm font-medium text-gray-900">
            {currentWeekStart.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            →
          </button>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(now.setDate(diff));
            monday.setHours(0, 0, 0, 0);
            setCurrentWeekStart(monday);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Day headers */}
        <div
          className="grid border-b border-gray-100"
          style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
        >
          <div className="p-3 border-r border-gray-100" />
          {weekDays.map((day) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div
                key={day.toISOString()}
                className="p-3 text-center border-r border-gray-100 last:border-r-0"
              >
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <div
                  className={`text-sm font-medium mt-1 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                    isToday ? "text-white" : "text-gray-900"
                  }`}
                  style={isToday ? { backgroundColor: brandColor } : {}}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid border-b border-gray-50 last:border-b-0"
              style={{
                gridTemplateColumns: "64px repeat(7, 1fr)",
                minHeight: "64px",
              }}
            >
              {/* Hour label */}
              <div className="p-2 border-r border-gray-100 flex items-start justify-end pr-3 pt-2">
                <span className="text-xs text-gray-400">
                  {hour === 12
                    ? "12pm"
                    : hour > 12
                      ? `${hour - 12}pm`
                      : `${hour}am`}
                </span>
              </div>

              {/* Day cells */}
              {weekDays.map((day) => {
                const dayBookings = getBookingsForDayAndHour(day, hour);
                return (
                  <div
                    key={day.toISOString()}
                    className="border-r border-gray-50 last:border-r-0 p-1 relative"
                  >
                    {dayBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full text-left p-2 rounded-lg text-xs font-medium text-white mb-1 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: brandColor }}
                      >
                        <p className="truncate">{booking.client_name}</p>
                        <p className="opacity-80 truncate">
                          {booking.service_name}
                        </p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Booking details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {selectedBooking.client_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.client_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedBooking.client_email}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium text-gray-900">
                    {selectedBooking.service_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Staff</span>
                  <span className="font-medium text-gray-900">
                    {selectedBooking.staff_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedBooking.booked_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedBooking.booked_at).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">
                    {selectedBooking.duration_mins} mins
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold" style={{ color: brandColor }}>
                    ${selectedBooking.price}
                  </span>
                </div>
              </div>

              {selectedBooking.client_phone && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {selectedBooking.client_phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
