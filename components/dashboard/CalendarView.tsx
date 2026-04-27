"use client";

import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { Modal } from "@/components/ds/Modal";
import { CalendarIcon, ClockIcon, ScissorsIcon, SearchIcon, UserIcon } from "@/components/ui/Icons";
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
  "var(--color-brand-600)",
  "var(--color-warning-600)",
  "var(--color-success-600)",
  "var(--color-accent-500)",
  "var(--color-info-600)",
  "var(--color-danger-600)",
  "var(--color-brand-500)",
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
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h2 font-bold text-ink-900 sm:text-h1">Calendar</h1>
          <p className="mt-1 text-body-sm text-ink-500 sm:text-body">
            Your weekly schedule
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          {/* Search */}
          <div className="relative min-w-0 flex-1 sm:max-w-[220px] lg:flex-initial">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search clients..."
              className="min-h-10 w-full rounded-full border border-ink-200 bg-ink-0 py-2.5 pl-9 pr-4 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
            />
          </div>

          {/* Week nav */}
          <div className="flex shrink-0 items-center justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={prevWeek}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-200 bg-ink-0 text-body-sm text-ink-900 hover:bg-ink-50"
            >
              ‹
            </button>
            <span className="min-w-[7.5rem] text-center text-body-sm font-semibold text-ink-900">
              {currentWeekStart.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-200 bg-ink-0 text-body-sm text-ink-900 hover:bg-ink-50"
            >
              ›
            </button>
          </div>

          <button
            type="button"
            onClick={goToToday}
            className="shrink-0 cursor-pointer rounded-full border-[1.5px] bg-ink-0 px-5 py-2 text-body-sm font-semibold"
            style={{ borderColor: brandColor, color: brandColor }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar grid — min width so week scrolls horizontally on phones */}
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-ink-0">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[760px]">
        {/* Day headers */}
        <div
          className="grid border-b border-ink-100"
          style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
        >
          <div className="px-2 py-4" />
          {weekDays.map((day) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div
                key={day.toISOString()}
                className="border-l border-ink-100 px-2 py-4 text-center"
              >
                <p
                  className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: isToday ? brandColor : "var(--color-ink-400)" }}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <div
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: isToday ? brandColor : "transparent",
                  }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ color: isToday ? "white" : "var(--color-ink-900)" }}
                  >
                    {day.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative max-h-[700px] overflow-y-auto">
          {/* Current time line */}
          {showTimeLine && (
            <div
              className="pointer-events-none absolute right-0 z-10 h-0.5 bg-danger-600"
              style={{
                top: `${currentTimePercent}%`,
                left: 60,
              }}
            >
              <div className="absolute -left-[5px] -top-1 h-2.5 w-2.5 rounded-full bg-danger-600" />
            </div>
          )}

          {hours.map((hour) => (
            <div
              key={hour}
              className="grid border-b border-ink-50"
              style={{
                gridTemplateColumns: "60px repeat(7, 1fr)",
                height: 64,
              }}
            >
              {/* Hour label */}
              <div className="flex items-start justify-end pr-3 pt-1">
                <span className="text-[11px] font-medium text-ink-400">
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
                    className="relative border-l border-ink-100 px-[3px] py-[2px]"
                    style={{
                      background: isToday ? `${brandColor}05` : "transparent",
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
                          className="absolute z-[5] cursor-pointer overflow-hidden rounded-md border-none px-2 py-1.5 text-left"
                          style={{
                            top: topOffset + 2,
                            left: 3,
                            right: 3,
                            height: Math.max(height - 4, 28),
                            background: color,
                          }}
                        >
                          <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-caption font-semibold leading-tight text-white">
                            {booking.client_name}
                          </p>
                          {height > 40 && (
                            <p className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-white/85">
                              {booking.service_name}
                            </p>
                          )}
                          {height > 56 && (
                            <p className="mt-0.5 text-[10px] text-white/75">
                              <ClockIcon size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
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
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden border-t border-ink-100 px-4 py-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:flex-wrap sm:gap-4 sm:px-5">
          <span className="shrink-0 text-caption font-semibold uppercase tracking-wide text-ink-400">
            Staff:
          </span>

          {/* All filter */}
          <button
            type="button"
            onClick={() => setSelectedStaffId("all")}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-none px-3 py-1 text-[13px] ${
              selectedStaffId === "all"
                ? "bg-ink-900 font-semibold text-ink-0"
                : "bg-transparent font-normal text-ink-700"
            }`}
          >
            All
          </button>

          {staff.map((member, i) => {
            const color = STAFF_COLORS[i % STAFF_COLORS.length];
            const isActive = selectedStaffId === member.id;
            return (
              <button
                type="button"
                key={member.id}
                onClick={() => setSelectedStaffId(isActive ? "all" : member.id)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-none px-3 py-1 text-[13px]"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? `${color}20` : "transparent",
                  color: isActive ? color : "var(--color-ink-700)",
                }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: color }}
                />
                {member.name}
              </button>
            );
          })}
        </div>
          </div>
        </div>
      </div>

      {/* Booking detail modal */}
      <Modal
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Appointment Details"
        size="sm"
      >
        {selectedBooking ? (
          <div>
            {/* Client */}
            <div className="mb-5 flex items-center gap-3 border-b border-ink-100 pb-4">
              <Avatar
                name={selectedBooking.client_name}
                size="md"
                className="h-11 w-11 text-base text-white"
                style={{
                  background:
                    staffColorMap[selectedBooking.staff_id] ?? brandColor,
                }}
              />
              <div>
                <p className="text-body font-semibold text-ink-900">
                  {selectedBooking.client_name}
                </p>
                <p className="text-body-sm text-ink-400">
                  {selectedBooking.client_email}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mb-5 flex flex-col gap-3">
              {[
                {
                  icon: <ScissorsIcon size={15} />,
                  label: "Service",
                  value: selectedBooking.service_name,
                },
                {
                  icon: <UserIcon size={15} />,
                  label: "Staff",
                  value: selectedBooking.staff_name,
                },
                {
                  icon: <CalendarIcon size={15} />,
                  label: "Date",
                  value: new Date(selectedBooking.booked_at).toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  ),
                },
                {
                  icon: <ClockIcon size={15} />,
                  label: "Time",
                  value: new Date(selectedBooking.booked_at).toLocaleTimeString(
                    "en-US",
                    { hour: "numeric", minute: "2-digit" }
                  ),
                },
                {
                  icon: <ClockIcon size={15} />,
                  label: "Duration",
                  value: `${selectedBooking.duration_mins} mins`,
                },
                {
                  icon: <span className="text-body-sm font-semibold">€</span>,
                  label: "Price",
                  value: `€${selectedBooking.price}`,
                  colored: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5 text-body-sm text-ink-500">
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <span
                    className="text-body-sm font-medium"
                    style={{
                      color: (item as { colored?: boolean }).colored
                        ? brandColor
                        : "var(--color-ink-900)",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <Button
              asChild
              variant="secondary"
              size="md"
              className="w-full"
              style={{
                color: brandColor,
                borderColor: `${brandColor}30`,
                background: `${brandColor}08`,
              }}
            >
              <Link href={`/bookings/${selectedBooking.id}`}>
                View Full Details →
              </Link>
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
