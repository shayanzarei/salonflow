/** Email + SMS dispatch (Twilio, etc.). */
export const notificationService = {
  async sendReminder(_bookingId: string) {
    return { ok: false as const };
  },
};
