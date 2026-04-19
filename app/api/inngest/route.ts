import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { sendBookingReminders } from '@/jobs/reminder.job';
import { sendTrialEmails } from '@/jobs/trial-reminder.job';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendBookingReminders, sendTrialEmails],
});