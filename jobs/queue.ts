/**
 * BullMQ queue setup — register workers in reminder.job / provisioning.job.
 */
export const queues = {
  reminders: "reminders",
  provisioning: "provisioning",
} as const;
