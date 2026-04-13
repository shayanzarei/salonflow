"use client";

import Link from "next/link";
import { useState } from "react";

import PortalAccessTab from "@/components/dashboard/PortalAccessTab";

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
}) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "portal">(
    "upcoming"
  );

  const tabs = [
    { id: "upcoming", label: "Upcoming Appointments" },
    { id: "past", label: "Past Appointments" },
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
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
    );
  }

  return (
    <div>
      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
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
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <select
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                color: "#555",
                background: "white",
                outline: "none",
              }}
            >
              <option>Next 7 Days</option>
              <option>Next 30 Days</option>
              <option>All upcoming</option>
            </select>
            <button
              style={{
                fontSize: 13,
                color: brand,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
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
