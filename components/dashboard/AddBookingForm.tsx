"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staffList.find((s) => s.id === staffId);

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
    setLoading(true);

    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("client_name", clientName);
    formData.append("client_email", clientEmail);
    formData.append("client_phone", clientPhone);
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

  const inputStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    color: "#111",
    background: "white",
    outline: "none",
    boxSizing: "border-box" as const,
  };

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
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Client details */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 16 }}>👤</span>
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
                    fontSize: 14,
                    color: "#aaa",
                  }}
                >
                  🔍
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
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
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +1 (555) 000-0000"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Appointment details */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 16 }}>📅</span>
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    style={inputStyle}
                  />
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
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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

        {/* Right column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 80,
          }}
        >
          {/* Summary card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
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
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: brand,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginBottom: 14,
              }}
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
              style={{
                width: "100%",
                padding: "11px",
                background: "white",
                color: "#666",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
