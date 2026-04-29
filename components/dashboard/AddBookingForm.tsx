"use client";

import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
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
  /**
   * Salon-local 24h wall-clock time (e.g. "14:00"). This is what we POST as
   * the `time` field — `/api/bookings/manual` runs `wallClockToUtc(date,
   * time, tenantZone)` and writes the correct UTC instant. Slicing isoTime
   * here would give us the UTC hour, not the salon-local hour, which is the
   * exact bug this field exists to prevent.
   */
  wallClockTime: string;
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
  const [submitError, setSubmitError] = useState("");

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
    setSubmitError("");
    const normalizedPhone = normalizePhoneInput(clientPhone);
    if (!isValidPhone(normalizedPhone)) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    if (!time) {
      setSubmitError("Pick an available time before creating the booking.");
      return;
    }
    setPhoneError("");
    setLoading(true);

    try {
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

      // The route returns a 3xx redirect on success. With `redirect: "manual"`
      // the browser surfaces that as `type === "opaqueredirect"` and `status === 0`.
      // Any other 4xx/5xx is a real failure (most commonly 409 "already booked").
      if (res.type !== "opaqueredirect" && !res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        // If the error indicates the slot is taken, also drop it from the local
        // dropdown so the owner can't pick it again without re-fetching.
        if (res.status === 409) {
          setAvailableSlots((prev) => prev.filter((s) => s.wallClockTime !== time));
          setTime("");
        }
        throw new Error(payload.error ?? "Failed to create booking.");
      }

      router.push("/bookings");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create booking."
      );
    } finally {
      setLoading(false);
    }
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
      setSubmitError("");
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

  const statusConfig: { value: string; label: string; variant: "success" | "warning" }[] = [
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "pending", label: "Pending", variant: "warning" },
  ];

  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-5">
        {/* Left column — form fields */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Client details */}
          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2">
              <UserIcon size={16} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Client Details
              </h2>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="mb-1.5 block text-label font-medium text-ink-700">
                Find Client
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <SearchIcon size={15} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search existing clients..."
                  autoComplete="off"
                  className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 py-2 pl-9 pr-4 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
                />
                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-ink-200 bg-ink-0 shadow-lg">
                    {searchResults.map((client) => (
                      <button
                        key={client.client_email}
                        type="button"
                        onClick={() => selectClient(client)}
                        className="flex w-full cursor-pointer items-center gap-2.5 border-0 border-b border-ink-100 bg-ink-0 px-4 py-3 text-left last:border-b-0 hover:bg-ink-50"
                      >
                        <Avatar
                          name={client.client_name}
                          size="sm"
                          className="text-xs text-white"
                          style={{ background: brand }}
                        />
                        <div>
                          <p className="text-body-sm font-medium text-ink-900">
                            {client.client_name}
                          </p>
                          <p className="text-caption text-ink-400">
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
              <Input
                id="add-booking-name"
                type="text"
                label="Full Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
              <Input
                id="add-booking-email"
                type="email"
                label="Email Address"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. jane@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-label font-medium text-ink-700">
                Phone Number{" "}
                <span className="font-normal text-ink-400">(Optional)</span>
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
                className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
              />
              {phoneError ? (
                <p className="mt-1 text-caption text-danger-600">{phoneError}</p>
              ) : null}
            </div>
          </Card>

          {/* Appointment details */}
          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2">
              <CalendarIcon size={16} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Appointment Details
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <Select
                id="add-booking-service"
                label="Service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              >
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — €{s.price} · {s.duration_mins}min
                  </option>
                ))}
              </Select>

              <Select
                id="add-booking-staff"
                label="Staff Member"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
              >
                <option value="">Select staff member...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.role}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Input
                  id="add-booking-date"
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={todayDate}
                />
                <div>
                  <Select
                    id="add-booking-time"
                    label="Time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={!canLoadAvailability || availabilityLoading || availableSlots.length === 0}
                  >
                    <option value="">
                      {availabilityLoading
                        ? "Loading availability..."
                        : "Select available time..."}
                    </option>
                    {/*
                       * value MUST be the salon-local 24h wall clock. Slicing
                       * slot.isoTime would yield the UTC hour and ship "12:00"
                       * for a 14:00 CEST slot. /api/bookings/manual then runs
                       * wallClockToUtc(date, time, tenantZone) on this value.
                       */}
                    {availableSlots.map((slot) => (
                      <option key={slot.isoTime} value={slot.wallClockTime}>
                        {slot.label}
                      </option>
                    ))}
                  </Select>
                  {availabilityError ? (
                    <p className="mt-1 text-caption text-danger-600">{availabilityError}</p>
                  ) : null}
                  {!availabilityLoading && canLoadAvailability && !availabilityError && availableSlots.length === 0 ? (
                    <p className="mt-1 text-caption text-warning-700">
                      No available times for this staff on the selected date.
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <Select
                  id="add-booking-status"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusConfig.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                {/* Status pills */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {statusConfig.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      className="cursor-pointer border-none bg-transparent p-0"
                    >
                      <Badge variant={status === s.value ? s.variant : "neutral"}>
                        {s.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column — summary + actions (sticky from lg) */}
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Summary card */}
          <Card variant="outlined">
            <div
              className="mb-5 flex items-center gap-2 pb-4"
              style={{ borderBottom: `2px solid ${brand}` }}
            >
              <span className="text-base">📋</span>
              <h2 className="text-body font-semibold text-ink-900">Summary</h2>
            </div>

            <div className="mb-5 flex flex-col gap-3.5">
              <div>
                <p className="mb-1 text-caption text-ink-400">Service</p>
                <p
                  className={`text-body-sm ${selectedService ? "font-medium text-ink-900" : "text-ink-300"}`}
                >
                  {selectedService?.name ?? "No service selected"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-caption text-ink-400">Staff</p>
                <p
                  className={`text-body-sm ${selectedStaff ? "font-medium text-ink-900" : "text-ink-300"}`}
                >
                  {selectedStaff?.name ?? "No staff selected"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-caption text-ink-400">Date &amp; Time</p>
                <p
                  className={`text-body-sm ${date && time ? "font-medium text-ink-900" : "text-ink-300"}`}
                >
                  {date && time
                    ? `${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${time}`
                    : "Not selected"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-caption text-ink-400">Duration</p>
                <p
                  className={`text-body-sm ${selectedService ? "text-ink-900" : "text-ink-300"}`}
                >
                  {selectedService
                    ? `${selectedService.duration_mins} min`
                    : "— min"}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 pt-3.5">
                <p className="text-body-sm font-medium text-ink-900">
                  Total Price
                </p>
                <p
                  className="text-h2 font-bold"
                  style={{ color: brand }}
                >
                  €
                  {selectedService
                    ? parseFloat(selectedService.price.toString()).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions card */}
          <Card variant="outlined">
            {submitError ? (
              <div
                role="alert"
                className="mb-3.5 rounded-md border border-danger-600 bg-danger-50 px-3 py-2 text-body-sm text-danger-700"
              >
                {submitError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading || !time}
              variant="primary"
              size="lg"
              className="mb-3.5 w-full"
              style={{ backgroundColor: brand }}
            >
              {loading ? "Creating..." : "Create Booking"}
            </Button>

            <label className="mb-3 flex cursor-pointer items-center gap-2 text-body-sm text-ink-700">
              <input
                type="checkbox"
                defaultChecked
                style={{ width: 14, height: 14, accentColor: brand }}
              />
              Send confirmation email
            </label>

            <p className="mb-3.5 text-caption text-ink-400">
              The client will receive a confirmation email if checked.
            </p>

            <Button
              type="button"
              onClick={() => window.history.back()}
              variant="secondary"
              size="md"
              className="w-full"
            >
              Cancel
            </Button>
          </Card>
        </div>
      </div>
    </form>
  );
}
