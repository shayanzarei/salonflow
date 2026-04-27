"use client";

import Link from "next/link";
import { useState } from "react";

import PortalAccessTab from "@/components/dashboard/PortalAccessTab";
import WorkingHoursTab, { type DayHours } from "@/components/dashboard/WorkingHoursTab";
import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Select } from "@/components/ds/Select";
import {
  Table,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";

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

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    confirmed: "success",
    pending: "warning",
    cancelled: "danger",
  };

  const statusIcon: Record<string, string> = {
    confirmed: "✓",
    pending: "⏳",
    cancelled: "✕",
  };

  function BookingTable({ bookings }: { bookings: Booking[] }) {
    if (bookings.length === 0) {
      return (
        <div className="px-6 py-12 text-center text-body-sm text-ink-400">
          No appointments found.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
      <Table className="min-w-[720px]">
        <thead>
          <THeadRow>
            <TH>Date &amp; Time</TH>
            <TH>Client</TH>
            <TH>Service</TH>
            <TH>Status</TH>
            <TH>Action</TH>
          </THeadRow>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const variant = statusVariant[booking.status] ?? "success";
            const icon = statusIcon[booking.status] ?? "✓";
            return (
              <TBodyRow key={booking.id} interactive={false}>
                <TD>
                  <p className="text-body-sm font-semibold text-ink-900">
                    {new Date(booking.booked_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-caption text-ink-400">
                    {new Date(booking.booked_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </TD>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      name={booking.client_name}
                      size="sm"
                      className="text-xs text-white"
                      style={{ background: brand }}
                    />
                    <div>
                      <p className="text-body-sm font-medium text-ink-900">
                        {booking.client_name}
                      </p>
                      <p className="text-caption text-ink-400">
                        {booking.client_email}
                      </p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <p className="text-body-sm text-ink-700">
                    {booking.service_name}
                  </p>
                  <p className="text-caption text-ink-400">
                    {booking.duration_mins} mins
                  </p>
                </TD>
                <TD>
                  <Badge variant={variant}>
                    {icon}{" "}
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </Badge>
                </TD>
                <TD>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="text-body-sm font-medium no-underline"
                    style={{ color: brand }}
                  >
                    View Details
                  </Link>
                </TD>
              </TBodyRow>
            );
          })}
        </tbody>
      </Table>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Tab nav — scroll horizontally on small screens */}
      <div className="-mx-1 mb-5 flex gap-0 overflow-x-auto overflow-y-hidden border-b border-ink-100 px-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "upcoming" | "past" | "portal" | "hours")}
            className="shrink-0 cursor-pointer border-none bg-transparent px-3 py-3 text-left text-body-sm sm:px-5 sm:py-3"
            style={{
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? brand : "var(--color-ink-500, #888)",
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
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-ink-0">
          {/* Filter */}
          <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="w-full sm:max-w-[200px]">
              <Select id="staff-tabs-range">
                <option>Next 7 Days</option>
                <option>Next 30 Days</option>
                <option>All upcoming</option>
              </Select>
            </div>
            <button
              type="button"
              className="shrink-0 cursor-pointer border-none bg-transparent text-left text-body-sm font-medium sm:text-right"
              style={{ color: brand }}
            >
              Export List
            </button>
          </div>
          <BookingTable bookings={upcomingBookings} />
        </div>
      )}

      {activeTab === "past" && (
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-ink-0">
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
