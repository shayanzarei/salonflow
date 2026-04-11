/** SMS/email reminders — enqueue from booking confirmation or cron. */
export async function runReminderJob(_bookingId: string) {
  return { ok: true as const };
}
