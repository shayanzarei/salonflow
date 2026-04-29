/**
 * scripts/test-concurrent-bookings.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Concurrency stress test for the `bookings_no_overlap` GiST exclusion
 * constraint (db/migrations/public/017_bookings_exclusion_constraint.sql).
 *
 * Run locally with:
 *   npx tsx scripts/test-concurrent-bookings.ts
 *
 * What this proves
 * ----------------
 * The application-level conflict check in lib/conflict-check.ts catches the
 * common case (sequential requests). The race it CAN'T catch is two clients
 * that both pass `findConflictingBooking` before either INSERTs — both see
 * the slot as free, both try to write. We claim the GiST exclusion constraint
 * stops that race at COMMIT with SQLSTATE 23P01. This script fires N parallel
 * INSERTs at the same `(staff_id, [start, end))` slot and asserts exactly one
 * succeeds and the rest are rejected as exclusion violations.
 *
 * Why we hit the DB directly instead of POSTing to /api/bookings/manual
 * --------------------------------------------------------------------
 * The constraint is the load-bearing safety net here — the route layer is a
 * happy-path optimisation. Hitting INSERT directly:
 *   • exercises exactly the contention we care about, no HTTP overhead;
 *   • doesn't fire 50 confirmation emails or notifications on the one success;
 *   • doesn't depend on the dev server being up;
 *   • doesn't depend on auth scaffolding for the manual route.
 * If the DB enforces the rule, no application bug can lose us a slot.
 *
 * Repeatability
 * -------------
 * The script picks a slot far in the future (~30 days out at 03:00 local) so
 * it's almost certainly free; if anything overlaps it pre-cleans those rows.
 * The single inserted row is removed in `finally`.
 */
import { Pool } from "pg";
import assert from "node:assert/strict";
import { config as loadDotenv } from "dotenv";

// .env.local is what `next dev` reads; mirror that here so the script Just Works.
loadDotenv({ path: ".env.local" });

const PARALLELISM = Number(process.env.STRESS_N ?? 50);
const PG_EXCLUSION_VIOLATION = "23P01";
// Under high same-range contention, GiST page-lock ordering causes Postgres
// to abort losing transactions as deadlocks (40P01) before the exclusion
// check fires. Functionally identical to 23P01 from the caller's perspective:
// someone else won the race for the slot. The route layer maps both to 409
// via lib/conflict-check.ts → isExclusionViolation. See AGENTS.md "Conflict
// checking" for the contract.
const PG_DEADLOCK_DETECTED = "40P01";

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is unset. Source it from .env.local or your shell before running."
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main(): Promise<void> {
  // ── Pick any tenant + a staff member of that tenant + a bookable service.
  //    We don't care WHO — we just need a valid (tenant_id, staff_id,
  //    service_id) triple so the FKs hold. The constraint logic only looks
  //    at staff_id + status + UTC range.
  const fixtureRes = await pool.query(`
    SELECT
      t.id  AS tenant_id,
      st.id AS staff_id,
      sv.id AS service_id,
      sv.duration_mins
    FROM tenants t
    JOIN staff    st ON st.tenant_id = t.id
    JOIN services sv ON sv.tenant_id = t.id
    LIMIT 1
  `);
  if (fixtureRes.rowCount === 0) {
    throw new Error(
      "No tenant/staff/service triple found. Seed the DB first or run this against an environment that has at least one salon configured."
    );
  }
  const { tenant_id, staff_id, service_id, duration_mins } = fixtureRes.rows[0];
  const durationMins: number = Number(duration_mins) || 30;

  // ── Pick a slot ~30 days out at an unused-hour offset. Far enough future
  //    that nothing realistic conflicts; specific enough we can clean it up.
  const startUtc = new Date(Date.now() + 30 * 24 * 60 * 60_000);
  startUtc.setUTCHours(3, 0, 0, 0); // 03:00:00 UTC, no fractional seconds
  const endUtc = new Date(startUtc.getTime() + durationMins * 60_000);

  console.log(
    `\n[stress] tenant=${tenant_id} staff=${staff_id} service=${service_id}`
  );
  console.log(
    `[stress] slot ${startUtc.toISOString()} → ${endUtc.toISOString()} (${durationMins} mins)`
  );
  console.log(`[stress] firing ${PARALLELISM} parallel INSERTs…\n`);

  // ── Pre-clean: if any previous run or stray row overlaps this exact slot,
  //    cancel it. Status='cancelled' takes the row out of the constraint's
  //    WHERE clause so it no longer participates in overlap detection.
  await pool.query(
    `UPDATE bookings
        SET status = 'cancelled'
      WHERE staff_id           = $1
        AND status             IN ('confirmed', 'pending')
        AND booking_start_utc  < $3::timestamptz
        AND booking_end_utc    > $2::timestamptz`,
    [staff_id, startUtc.toISOString(), endUtc.toISOString()]
  );

  // ── Fire N parallel INSERTs from N independent connections.
  //    Each gets its own client so they actually contend at COMMIT instead
  //    of serialising through one pool slot.
  const attempts = Array.from({ length: PARALLELISM }, (_, i) =>
    insertOne(i, {
      tenant_id,
      staff_id,
      service_id,
      startUtc,
      endUtc,
    })
  );
  const results = await Promise.allSettled(attempts);

  // ── Tally outcomes.
  let successes = 0;
  let exclusionViolations = 0;
  let deadlocks = 0;
  let otherErrors = 0;
  const otherErrorMessages: string[] = [];
  let winningBookingId: string | null = null;

  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value.kind === "success") {
        successes++;
        winningBookingId = r.value.bookingId;
      } else if (r.value.kind === "exclusion_violation") {
        exclusionViolations++;
      } else if (r.value.kind === "deadlock") {
        deadlocks++;
      }
    } else {
      otherErrors++;
      otherErrorMessages.push(String(r.reason?.message ?? r.reason));
    }
  }

  console.log(`[stress] successes:           ${successes}`);
  console.log(`[stress] exclusion (23P01):   ${exclusionViolations}`);
  console.log(`[stress] deadlock  (40P01):   ${deadlocks}`);
  console.log(`[stress] other errors:        ${otherErrors}`);
  if (otherErrorMessages.length > 0) {
    console.log(`[stress] sample other errors:`);
    for (const m of otherErrorMessages.slice(0, 3)) {
      console.log(`  - ${m}`);
    }
  }

  // ── Clean up the winning row before asserting, so a failure here doesn't
  //    leave a phantom booking on someone's calendar.
  if (winningBookingId) {
    await pool.query(`DELETE FROM bookings WHERE id = $1`, [winningBookingId]);
    console.log(`[stress] cleaned up winning booking ${winningBookingId}`);
  }

  // ── The contract: exactly 1 success, every other attempt rejected by the
  //    DB layer (either 23P01 directly OR 40P01 from GiST page-lock ordering),
  //    zero unexpected errors. Both error codes prove the same thing — no two
  //    overlapping rows can coexist — and lib/conflict-check.ts maps both to
  //    HTTP 409. Any other shape means the constraint isn't holding under
  //    contention, which is a launch blocker.
  assert.equal(successes, 1, "exactly one INSERT must succeed");
  assert.equal(
    exclusionViolations + deadlocks,
    PARALLELISM - 1,
    `exactly ${PARALLELISM - 1} INSERTs must fail with 23P01 or 40P01 (got ${exclusionViolations} + ${deadlocks})`
  );
  assert.equal(otherErrors, 0, "no other errors expected");

  console.log(
    `\n[stress] PASS — constraint holds under contention (${successes} success, ${exclusionViolations} exclusion, ${deadlocks} deadlock).`
  );
}

interface InsertResult {
  kind: "success" | "exclusion_violation" | "deadlock";
  bookingId: string | null;
}

async function insertOne(
  i: number,
  args: {
    tenant_id: string;
    staff_id: string;
    service_id: string;
    startUtc: Date;
    endUtc: Date;
  }
): Promise<InsertResult> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO bookings
        (tenant_id, service_id, staff_id, client_name, client_email, client_phone,
         booking_start_utc, booking_end_utc, provider_iana_timezone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        args.tenant_id,
        args.service_id,
        args.staff_id,
        `stress-test-${i}`,
        `stress-${i}@example.invalid`,
        "+31000000000",
        args.startUtc,
        args.endUtc,
        "Europe/Amsterdam",
        "confirmed",
      ]
    );
    return { kind: "success", bookingId: rows[0].id as string };
  } catch (err: unknown) {
    const code =
      err && typeof err === "object"
        ? (err as { code?: unknown }).code
        : undefined;
    if (code === PG_EXCLUSION_VIOLATION) {
      return { kind: "exclusion_violation", bookingId: null };
    }
    if (code === PG_DEADLOCK_DETECTED) {
      return { kind: "deadlock", bookingId: null };
    }
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error("\n[stress] FAIL:", err.message ?? err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
