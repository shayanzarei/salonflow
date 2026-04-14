import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Viewer = {
  tenantId: string;
  recipientRole: "owner" | "staff";
  recipientId: string;
};

function getViewer(session: Awaited<ReturnType<typeof getServerSession>>): Viewer | null {
  if (!session?.tenantId) return null;
  if (session.isStaff) {
    if (!session.staffId) return null;
    return {
      tenantId: session.tenantId,
      recipientRole: "staff",
      recipientId: session.staffId,
    };
  }

  return {
    tenantId: session.tenantId,
    recipientRole: "owner",
    recipientId: session.tenantId,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const viewer = getViewer(session);
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [listResult, unreadResult] = await Promise.all([
    pool.query(
      `SELECT
         n.id,
         n.type,
         n.title,
         n.message,
         n.link_url,
         n.created_at,
         nr.read_at
       FROM notification_recipients nr
       JOIN notifications n ON n.id = nr.notification_id
       WHERE nr.tenant_id = $1
         AND nr.recipient_role = $2
         AND nr.recipient_id = $3
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [viewer.tenantId, viewer.recipientRole, viewer.recipientId]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS count
       FROM notification_recipients nr
       WHERE nr.tenant_id = $1
         AND nr.recipient_role = $2
         AND nr.recipient_id = $3
         AND nr.read_at IS NULL`,
      [viewer.tenantId, viewer.recipientRole, viewer.recipientId]
    ),
  ]);

  return NextResponse.json({
    notifications: listResult.rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      linkUrl: row.link_url,
      createdAt: row.created_at,
      readAt: row.read_at,
    })),
    unreadCount: unreadResult.rows[0]?.count ?? 0,
  });
}
