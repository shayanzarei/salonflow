import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const viewer = getViewer(session);
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const notificationId = typeof body.notificationId === "string" ? body.notificationId : null;

  if (notificationId) {
    await pool.query(
      `UPDATE notification_recipients
       SET read_at = COALESCE(read_at, now())
       WHERE notification_id = $1
         AND tenant_id = $2
         AND recipient_role = $3
         AND recipient_id = $4`,
      [
        notificationId,
        viewer.tenantId,
        viewer.recipientRole,
        viewer.recipientId,
      ]
    );
  } else {
    await pool.query(
      `UPDATE notification_recipients
       SET read_at = COALESCE(read_at, now())
       WHERE tenant_id = $1
         AND recipient_role = $2
         AND recipient_id = $3
         AND read_at IS NULL`,
      [viewer.tenantId, viewer.recipientRole, viewer.recipientId]
    );
  }

  return NextResponse.json({ ok: true });
}
