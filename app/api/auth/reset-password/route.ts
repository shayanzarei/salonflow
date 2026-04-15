import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
      confirmPassword?: string;
    };

    const token = body.token?.trim() ?? "";
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenResult = await pool.query(
      `SELECT id, tenant_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (!tokenResult.rows[0]) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired." },
        { status: 400 }
      );
    }

    const tokenId: string = tokenResult.rows[0].id;
    const tenantId: string = tokenResult.rows[0].tenant_id;
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query("BEGIN");
    await pool.query(`UPDATE tenants SET password_hash = $1 WHERE id = $2`, [
      passwordHash,
      tenantId,
    ]);
    await pool.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [tokenId]
    );
    await pool.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE tenant_id = $1
         AND id <> $2
         AND used_at IS NULL`,
      [tenantId, tokenId]
    );
    await pool.query("COMMIT");

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    await pool.query("ROLLBACK").catch(() => undefined);
    const message =
      error instanceof Error ? error.message : "Failed to reset password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
