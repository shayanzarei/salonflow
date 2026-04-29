"use client";

import { Avatar } from "@/components/ds/Avatar";
import { XIcon } from "@/components/ui/Icons";
import { useState } from "react";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  /**
   * Canonical UTC start instant. Always re-format with Intl + tenantZone for
   * display; never call `.toDateString()` / `.toLocaleString()` without an
   * explicit timeZone — those read in the browser's zone and group bookings
   * into the wrong day for staff members travelling abroad.
   */
  booking_start_utc: string;
  service_name: string;
  duration_mins: number;
  price: number;
  staff_name: string;
  staff_id: string;
  status: string;
}

export default function StaffCalendarView({
  bookings,
  brandColor,
  tenantZone,
}: {
  bookings: Booking[];
  brandColor: string;
  /** Salon's IANA zone — every clock-related computation runs against it. */
  tenantZone: string;
}) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Salon-local YYYY-MM-DD key. Using en-CA gives the ISO-ish ordering for
  // free, and going through the tenant zone means a booking at 23:30
  // Amsterdam never accidentally lands on the previous day for a staff
  // member whose browser is in a westerly zone.
  const ymdInTenantZone = (instant: Date): string =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tenantZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(instant);

  const grouped = bookings.reduce(
    (acc, booking) => {
      const day = ymdInTenantZone(new Date(booking.booking_start_utc));
      if (!acc[day]) acc[day] = [];
      acc[day].push(booking);
      return acc;
    },
    {} as Record<string, Booking[]>
  );

  const days = Object.keys(grouped).sort(); // YYYY-MM-DD strings sort lexicographically

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upcoming appointments</h2>
        </div>

        {days.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No upcoming appointments.
          </div>
        ) : (
          <div>
            {days.map((day) => (
              <div key={day}>
                <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {/* `day` is a salon-local YYYY-MM-DD; parse as a midday-
                        UTC instant to dodge any DST edge, then re-format via
                        Intl in the tenant zone for the human label. */}
                    {new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", {
                      timeZone: tenantZone,
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {grouped[day].map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={booking.client_name}
                        size="sm"
                        className="h-9 w-9 flex-shrink-0 text-sm font-medium text-white"
                        style={{ backgroundColor: brandColor }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.client_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.service_name} · {booking.duration_mins} mins
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.booking_start_utc).toLocaleTimeString(
                          "en-US",
                          {
                            timeZone: tenantZone,
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <p className="text-xs text-gray-400">€{booking.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

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
              <h3 className="font-semibold text-gray-900">
                Appointment details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400"
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  name={selectedBooking.client_name}
                  size="md"
                  className="h-10 w-10 font-medium text-white"
                  style={{ backgroundColor: brandColor }}
                />
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
                {[
                  { label: "Service", value: selectedBooking.service_name },
                  {
                    label: "Date",
                    value: new Date(
                      selectedBooking.booking_start_utc
                    ).toLocaleDateString("en-US", {
                      timeZone: tenantZone,
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  {
                    label: "Time",
                    value: new Date(
                      selectedBooking.booking_start_utc
                    ).toLocaleTimeString("en-US", {
                      timeZone: tenantZone,
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  },
                  {
                    label: "Duration",
                    value: `${selectedBooking.duration_mins} mins`,
                  },
                  { label: "Price", value: `€${selectedBooking.price}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
