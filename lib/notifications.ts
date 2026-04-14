import pool from "@/lib/db";

type Recipient = {
  role: "owner" | "staff";
  id: string;
};

type CreateNotificationInput = {
  tenantId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  data?: Record<string, unknown>;
  recipients: Recipient[];
};

export async function createNotification(input: CreateNotificationInput) {
  const recipients = Array.from(
    new Map(
      input.recipients
        .filter((recipient) => recipient.id)
        .map((recipient) => [`${recipient.role}:${recipient.id}`, recipient])
    ).values()
  );

  if (recipients.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const notificationResult = await client.query(
      `INSERT INTO notifications
        (tenant_id, type, title, message, link_url, data_json)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        input.tenantId,
        input.type,
        input.title,
        input.message,
        input.linkUrl ?? null,
        input.data ?? {},
      ]
    );

    const notificationId = notificationResult.rows[0].id as string;

    for (const recipient of recipients) {
      await client.query(
        `INSERT INTO notification_recipients
          (notification_id, tenant_id, recipient_role, recipient_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (notification_id, recipient_role, recipient_id) DO NOTHING`,
        [notificationId, input.tenantId, recipient.role, recipient.id]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
