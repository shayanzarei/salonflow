/**
 * requireOwner — call at the top of any API route that must only be reached
 * by a salon owner (not a staff member, not unauthenticated).
 *
 * Usage:
 *   const guard = await requireOwner();
 *   if (guard.error) return guard.error;
 *   // guard.session is now the verified owner session
 */

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type OwnerSession = Session & {
  isStaff: boolean;
  isAdmin: boolean;
  tenantId: string;
  slug: string;
  staffId: string | null;
};

type GuardResult =
  | { error: NextResponse; session?: never }
  | { error?: never; session: OwnerSession };

export async function requireOwner(): Promise<GuardResult> {
  const session = (await getServerSession(authOptions)) as OwnerSession | null;

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.isStaff === true) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: staff accounts cannot perform this action" },
        { status: 403 }
      ),
    };
  }

  return { session };
}
