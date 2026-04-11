export type Booking = {
  id: string;
  tenantId: string;
  serviceId: string;
  staffId: string | null;
  startsAt: string;
  endsAt: string;
  status: "pending" | "confirmed" | "cancelled";
};
