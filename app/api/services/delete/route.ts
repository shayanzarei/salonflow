import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;

    await pool.query(`DELETE FROM services WHERE id = $1 AND tenant_id = $2`, [
      id,
      tenant.id,
    ]);

    return NextResponse.redirect(new URL("/services", req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
