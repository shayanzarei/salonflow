import pool from "@/lib/db";

export default async function AdminContactsPage() {
  const result = await pool.query(
    `SELECT
      id,
      source,
      first_name,
      last_name,
      email,
      topic,
      subject,
      message,
      status,
      created_at
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT 500`
  );

  const rows = result.rows;

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Contact Messages</h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Contact form submissions and inbound emails from Resend webhooks.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No contact messages yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-5 py-3.5">Topic / Subject</th>
                  <th className="px-5 py-3.5">Message</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="text-sm text-gray-800">
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {row.source === "contact_form" ? "Contact Form" : "Inbound Email"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-xs text-gray-500">{row.email ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{row.topic ?? row.subject ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <p className="max-w-[420px] whitespace-pre-wrap break-words">
                        {row.message ?? "No body captured in webhook payload metadata."}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(row.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

