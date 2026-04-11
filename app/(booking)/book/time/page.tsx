import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function ChooseTimePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service, staff } = await searchParams;

  // fetch service and staff details
  const [serviceResult, staffResult] = await Promise.all([
    pool.query(`SELECT * FROM services WHERE id = $1 AND tenant_id = $2`, [service, tenant.id]),
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [staff, tenant.id]),
  ]);

  const selectedService = serviceResult.rows[0];
  const selectedStaff = staffResult.rows[0];

  if (!selectedService || !selectedStaff) notFound();

  // generate time slots for today + next 6 days
  const slots = generateSlots();

  return (
    <div>
      <div className="mb-8">
        <a
          href={`/book/staff?service=${service}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Choose a time
        </h1>
        <p className="text-gray-500 mt-1">
          {selectedService.name} with {selectedStaff.name}
        </p>
      </div>

      <div className="space-y-6">
        {slots.map((day) => (
          <div key={day.date}>
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              {day.label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {day.times.map((time) => (
                <a
                  key={time.value}
                  href={`/book/confirm?service=${service}&staff=${staff}&time=${time.value}`}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600 transition-colors bg-white"
                >
                  {time.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// generates time slots for the next 7 days, 9am–5pm, every 30 mins
function generateSlots() {
  const days = [];
  const now = new Date();

  for (let d = 0; d < 7; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);

    const label = d === 0
      ? 'Today'
      : d === 1
      ? 'Tomorrow'
      : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const times = [];
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const slotDate = new Date(date);
        slotDate.setHours(h, m, 0, 0);

        // skip past slots for today
        if (slotDate <= now) continue;

        times.push({
          value: slotDate.toISOString(),
          label: slotDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
        });
      }
    }

    if (times.length > 0) {
      days.push({ date: date.toDateString(), label, times });
    }
  }

  return days;
}