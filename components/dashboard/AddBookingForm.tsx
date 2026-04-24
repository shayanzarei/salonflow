"use client";

import { CalendarIcon, SearchIcon, UserIcon } from "@/components/ui/Icons";
import { isValidPhone, normalizePhoneInput, PHONE_INPUT_PATTERN } from "@/lib/phone";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_mins: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Client {
  client_name: string;
  client_email: string;
  client_phone: string | null;
}

interface AvailabilitySlot {
  isoTime: string;
  label: string;
  available: boolean;
}

export default function AddBookingForm({
  services,
  staffList,
  brand,
  tenantId,
}: {
  services: Service[];
  staffList: Staff[];
  brand: string;
  tenantId: string;
}) {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staffList.find((s) => s.id === staffId);
  const canLoadAvailability = Boolean(serviceId && staffId && date);
  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    setClientName(q);
    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const res = await fetch(`/api/clients/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSearchResults(data);
    setShowDropdown(data.length > 0);
  }

  function selectClient(client: Client) {
    setClientName(client.client_name);
    setClientEmail(client.client_email);
    setClientPhone(client.client_phone ?? "");
    setSearchQuery(client.client_name);
    setShowDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedPhone = normalizePhoneInput(clientPhone);
    if (!isValidPhone(normalizedPhone)) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    if (!time) {
      return;
    }
    setPhoneError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("client_name", clientName);
    formData.append("client_email", clientEmail);
    formData.append("client_phone", normalizedPhone ?? "");
    formData.append("service_id", serviceId);
    formData.append("staff_id", staffId);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("status", status);

    const res = await fetch("/api/bookings/manual", {
      method: "POST",
      body: formData,
      redirect: "manual",
    });

    router.push("/bookings");
  }

  useEffect(() => {
    let active = true;
    async function loadAvailability() {
      if (!canLoadAvailability) {
        setAvailableSlots([]);
        setAvailabilityError("");
        setTime("");
        return;
      }

      setAvailabilityLoading(true);
      setAvailabilityError("");
      setTime("");
      try {
        const res = await fetch(
          `/api/bookings/availability?serviceId=${serviceId}&staffId=${staffId}&date=${date}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Failed to load staff availability.");
        }
        const payload = (await res.json()) as { slots: AvailabilitySlot[] };
        if (!active) return;
        const openSlots = payload.slots.filter((slot) => slot.available);
        setAvailableSlots(openSlots);
      } catch (error) {
        if (!active) return;
        setAvailableSlots([]);
        setAvailabilityError(
          error instanceof Error ? error.message : "Failed to load staff availability."
        );
      } finally {
        if (active) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();
    return () => {
      active = false;
    };
  }, [canLoadAvailability, date, serviceId, staffId]);

  const inputStyle = {
    width: "100%",
    minHeight: 44,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 16,
    color: "#111",
    background: "white",
    outline: "none",
    boxSizing: "border-box" as const,
  } as const;

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#555",
    marginBottom: 6,
  } as const;

  const statusConfig = [
    { value: "confirmed", label: "Confirmed", color: "#10B981" },
    { value: "pending", label: "Pending", color: "#F59E0B" },
  ];

  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-5">
        {/* Left column — form fields */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Client details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <UserIcon size={16} color="#6B7280" />
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Client Details
              </h2>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Find Client</label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#aaa",
                    display: "flex",
                  }}
                >
                  <SearchIcon size={15} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search existing clients..."
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  autoComplete="off"
                />
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      zIndex: 10,
                      overflow: "hidden",
                      marginTop: 4,
                    }}
                  >
                    {searchResults.map((client) => (
                      <button
                        key={client.client_email}
                        type="button"
                        onClick={() => selectClient(client)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "white",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          borderBottom: "1px solid #f5f5f5",
                        }}
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
                          {client.client_name.charAt(0)}
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
                            {client.client_name}
                          </p>
                          <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                            {client.client_email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                Phone Number{" "}
                <span style={{ color: "#aaa", fontWeight: 400 }}>
                  (Optional)
                </span>
              </label>
              <input
                type="tel"
                value={clientPhone}
                pattern={PHONE_INPUT_PATTERN}
                onChange={(e) => {
                  setClientPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="e.g. +1 (555) 000-0000"
                style={inputStyle}
              />
              {phoneError ? (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              ) : null}
            </div>
          </div>

          {/* Appointment details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <CalendarIcon size={16} color="#6B7280" />
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Appointment Details
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — €{s.price} · {s.duration_mins}min
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Staff Member</label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">Select staff member...</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={todayDate}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={!canLoadAvailability || availabilityLoading || availableSlots.length === 0}
                    style={inputStyle}
                  >
                    <option value="">
                      {availabilityLoading
                        ? "Loading availability..."
                        : "Select available time..."}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot.isoTime} value={slot.isoTime.slice(11, 16)}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  {availabilityError ? (
                    <p className="mt-1 text-xs text-red-600">{availabilityError}</p>
                  ) : null}
                  {!availabilityLoading && canLoadAvailability && !availabilityError && availableSlots.length === 0 ? (
                    <p className="mt-1 text-xs text-amber-700">
                      No available times for this staff on the selected date.
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={inputStyle}
                >
                  {statusConfig.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {/* Status pills */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {statusConfig.map((s) => (
                    <span
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 12px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        border:
                          status === s.value ? "none" : "1px solid #e5e7eb",
                        background:
                          status === s.value ? `${s.color}20` : "white",
                        color: status === s.value ? s.color : "#aaa",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: s.color,
                        }}
                      />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — summary + actions (sticky from lg) */}
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Summary card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: `2px solid ${brand}`,
              }}
            >
              <span style={{ fontSize: 16 }}>📋</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Summary
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 3px" }}>
                  Service
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: selectedService ? "#111" : "#ccc",
                    margin: 0,
                    fontWeight: selectedService ? 500 : 400,
                  }}
                >
                  {selectedService?.name ?? "No service selected"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 3px" }}>
                  Staff
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: selectedStaff ? "#111" : "#ccc",
                    margin: 0,
                    fontWeight: selectedStaff ? 500 : 400,
                  }}
                >
                  {selectedStaff?.name ?? "No staff selected"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 3px" }}>
                  Date & Time
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: date && time ? "#111" : "#ccc",
                    margin: 0,
                    fontWeight: date && time ? 500 : 400,
                  }}
                >
                  {date && time
                    ? `${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${time}`
                    : "Not selected"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 3px" }}>
                  Duration
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: selectedService ? "#111" : "#ccc",
                    margin: 0,
                  }}
                >
                  {selectedService
                    ? `${selectedService.duration_mins} min`
                    : "— min"}
                </p>
              </div>

              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  Total Price
                </p>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: brand,
                    margin: 0,
                  }}
                >
                  €
                  {selectedService
                    ? parseFloat(selectedService.price.toString()).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
            <button
              type="submit"
              disabled={loading || !time}
              className="mb-3.5 w-full min-h-12 rounded-[10px] border-none text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: brand, padding: "13px" }}
            >
              {loading ? "Creating..." : "Create Booking"}
            </button>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#555",
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ width: 14, height: 14, accentColor: brand }}
              />
              Send confirmation email
            </label>

            <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 14px" }}>
              The client will receive a confirmation email if checked.
            </p>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full min-h-11 cursor-pointer rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
