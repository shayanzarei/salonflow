import {
  Table,
  TableContainer,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
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

      <TableContainer className="rounded-2xl border-gray-100">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No contact messages yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[1100px]">
              <thead>
                <THeadRow>
                  <TH>Source</TH>
                  <TH>Sender</TH>
                  <TH>Topic / Subject</TH>
                  <TH>Message</TH>
                  <TH>Status</TH>
                  <TH>Received</TH>
                </THeadRow>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <TBodyRow key={row.id} interactive={false}>
                    <TD>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {row.source === "contact_form" ? "Contact Form" : "Inbound Email"}
                      </span>
                    </TD>
                    <TD>
                      <p className="font-medium text-gray-900">
                        {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-xs text-gray-500">{row.email ?? "—"}</p>
                    </TD>
                    <TD>
                      <p className="font-medium text-gray-900">{row.topic ?? row.subject ?? "—"}</p>
                    </TD>
                    <TD className="text-gray-600">
                      <p className="max-w-[420px] whitespace-pre-wrap break-words">
                        {row.message ?? "No body captured in webhook payload metadata."}
                      </p>
                    </TD>
                    <TD>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                        {row.status}
                      </span>
                    </TD>
                    <TD className="text-xs text-gray-500">
                      {new Date(row.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TD>
                  </TBodyRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </TableContainer>
    </div>
  );
}

