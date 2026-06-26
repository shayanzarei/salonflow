import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { mergeProfessionalContent } from "@/lib/professional-template";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * Super-admin endpoint for the Professional template's bilingual content
 * (migration 020). Unlike the Signature copy route this takes a JSON body
 * (the editor is a controlled client form), not multipart form data:
 *
 *   { tenant_id: string, content: ProfessionalContent }
 *
 * The submitted content is normalised through mergeProfessionalContent before
 * storage, so the persisted JSONB is always a complete, well-shaped document
 * (unknown keys dropped, missing keys defaulted) regardless of client drift.
 */
export async function POST(req: NextRequest) {
  // Admin guard. The (admin) page layout protects the editor UI, but API
  // route handlers aren't covered by that layout, so we re-check here.
  const session = await getServerSession(authOptions);
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const tenantId = body?.tenant_id;
    if (!tenantId || typeof tenantId !== "string") {
      return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
    }
    if (typeof body?.content !== "object" || body.content === null) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const normalized = mergeProfessionalContent(body.content);

    const result = await pool.query(
      `UPDATE tenants SET professional_content = $1::jsonb WHERE id = $2`,
      [JSON.stringify(normalized), tenantId]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
