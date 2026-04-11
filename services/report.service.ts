export const reportService = {
  async summary(_tenantId: string) {
    return { revenue: 0, bookings: 0 };
  },
};
