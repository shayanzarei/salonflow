/**
 * Booking slot algorithm — used by /api/availability and booking flow.
 */
export function computeSlots(_input: {
  serviceId: string;
  staffId?: string;
  from: Date;
  to: Date;
}): Date[] {
  return [];
}
