/** Default services, business hours, etc., applied on createTenant(). */
export const tenantDefaultSeed = {
  services: [] as { name: string; durationMinutes: number }[],
  businessHours: [] as { dayOfWeek: number; open: string; close: string }[],
};
