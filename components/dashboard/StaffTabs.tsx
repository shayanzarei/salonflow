"use client";

import Link from "next/link";
import { useState } from "react";

import PortalAccessTab from "@/components/dashboard/PortalAccessTab";
import WorkingHoursTab, { type DayHours } from "@/components/dashboard/WorkingHoursTab";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  booked_at: string;
  status: string;
  service_name: string;
  duration_mins: number;
  price: number;
}

interface Activity {
  id: string;
  action: string;
  device: string | null;
  created_at: string;
}

export default function StaffTabs({
  staffId,
  tenantId,
  staffName,
  staffEmail,
  hasPortal,
  upcomingBookings,
  pastBookings,
  brand,
  activity,
  workingHours,
}: {
  staffId: string;
  tenantId: string;
  staffName: string;
  staffEmail: string;
  hasPortal: boolean;
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  brand: string;
  activity: Activity[];
  workingHours: DayHours[];
}) {
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "portal" | "hours"
  >("upcoming");

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "hours", label: "Working Hours" },
    { id: "portal", label: "Portal Access" },
  ];

  const statusConfig: Record<
    string,
    { color: string; bg: string; icon: string }
  > = {
    confirmed: { color: "#059669", bg: "#ECFDF5", icon: "✓" },
    pending: { color: "#D97706", bg: "#FFFBEB", icon: "⏳" },
    cancelled: { color: "#DC2626", bg: "#FEF2F2", icon: "✕" },
  };

  function BookingTable({ bookings }: { bookings: Booking[] }) {
    if (bookings.length === 0) {
      return (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "#aaa",
            fontSize: 14,
          }}
        >
          No appointments found.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
            {["Date & Time", "Client", "Service", "Status", "Action"].map(
              (h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const sc = statusConfig[booking.status] ?? statusConfig.confirmed;
            return (
              <tr
                key={booking.id}
                style={{ borderBottom: "1px solid #f9f9f9" }}
              >
                <td style={{ padding: "16px 20px" }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111",
                      margin: 0,
                    }}
                  >
                    {new Date(booking.booked_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                    {new Date(booking.booked_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: brand,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {booking.client_name.charAt(0)}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111",
                          margin: 0,
                        }}
                      >
                        {booking.client_name}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {booking.client_email}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 13, color: "#333", margin: 0 }}>
                    {booking.service_name}
                  </p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                    {booking.duration_mins} mins
                  </p>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 500,
                      color: sc.color,
                      background: sc.bg,
                      padding: "4px 10px",
                      borderRadius: 100,
                    }}
                  >
                    {sc.icon}{" "}
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    style={{
                      fontSize: 13,
                      color: brand,
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Tab nav — scroll horizontally on small screens */}
      <div className="-mx-1 mb-5 flex gap-0 overflow-x-auto overflow-y-hidden border-b border-gray-100 px-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "upcoming" | "past" | "portal" | "hours")}
            className="shrink-0 cursor-pointer border-none bg-transparent px-3 py-3 text-left text-sm sm:px-5 sm:py-3 sm:text-[14px]"
            style={{
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? brand : "#888",
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${brand}`
                  : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "upcoming" && (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
        >
          {/* Filter */}
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <select className="min-h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none sm:max-w-[200px]">
              <option>Next 7 Days</option>
              <option>Next 30 Days</option>
              <option>All upcoming</option>
            </select>
            <button
              type="button"
              className="shrink-0 text-left text-sm font-medium sm:text-right"
              style={{ color: brand, background: "none", border: "none", cursor: "pointer" }}
            >
              Export List
            </button>
          </div>
          <BookingTable bookings={upcomingBookings} />
        </div>
      )}

      {activeTab === "past" && (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
        >
          <BookingTable bookings={pastBookings} />
        </div>
      )}

      {activeTab === "hours" && (
        <WorkingHoursTab
          staffId={staffId}
          brand={brand}
          initialHours={workingHours}
        />
      )}

      {activeTab === "portal" && (
        <PortalAccessTab
          staffId={staffId}
          tenantId={tenantId}
          staffEmail={staffEmail}
          staffName={staffName}
          hasPortal={hasPortal}
          brand={brand}
          activity={activity}
        />
      )}
    </div>
  );
}
