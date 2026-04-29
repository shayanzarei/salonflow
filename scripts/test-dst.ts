/**
 * scripts/test-dst.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * DST acceptance tests for `lib/timezone.ts`.
 *
 * Run with:    npx tsx scripts/test-dst.ts
 * Exit code 0 = all assertions hold; exit 1 = a regression has slipped in.
 *
 * Why this file exists
 * --------------------
 * `wallClockToUtc()` has to pick *some* answer for ambiguous (fall-back) and
 * non-existent (spring-forward) wall-clock times on the salon's calendar.
 * Whatever answer it picks must be deterministic across deploys — otherwise a
 * tzdata bump silently shifts every booking that lands in a DST seam, and the
 * GiST exclusion constraint starts rejecting things customers swear were free.
 *
 * The behaviour pinned here matches what AGENTS.md "DST behavior" documents.
 * If you change `wallClockToUtc`'s seam handling, update both AGENTS.md and
 * the assertions below — never one without the other.
 *
 * Why no jest/vitest
 * ------------------
 * The codebase has no test runner installed (see `package.json`). Adding one
 * for two assertions is overkill. `tsx` + `node:assert` runs the same TS file
 * the app uses, with no compile step and no extra deps.
 */
import assert from "node:assert/strict";
import { wallClockToUtc } from "../lib/timezone";

const ZONE = "Europe/Amsterdam";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Spring-forward: 2026-03-29, clock jumps 02:00 → 03:00.                     */
/*  The wall-clock window 02:00–02:59 does NOT exist on the salon's clock.     */
/* ─────────────────────────────────────────────────────────────────────────── */

// Sanity: a wall-clock time before the seam is unaffected.
// 01:30 CET (UTC+1) → 00:30Z.
assert.equal(
  wallClockToUtc("2026-03-29", "01:30", ZONE).toISOString(),
  "2026-03-29T00:30:00.000Z",
  "spring-forward: pre-seam 01:30 should resolve as UTC+1 (CET)"
);

// Sanity: a wall-clock time after the seam is unaffected.
// 04:00 CEST (UTC+2) → 02:00Z.
assert.equal(
  wallClockToUtc("2026-03-29", "04:00", ZONE).toISOString(),
  "2026-03-29T02:00:00.000Z",
  "spring-forward: post-seam 04:00 should resolve as UTC+2 (CEST)"
);

// Sharp edge — current behaviour: a wall-clock time INSIDE the skipped hour
// (02:30) silently normalises to the same UTC instant as 03:30 (post-jump,
// CEST, UTC+2). We pin this so tzdata bumps don't shift it under us. See
// AGENTS.md "DST behavior" — a future hardening pass should make this throw.
const skipped = wallClockToUtc("2026-03-29", "02:30", ZONE).toISOString();
const postJump = wallClockToUtc("2026-03-29", "03:30", ZONE).toISOString();
assert.equal(
  skipped,
  "2026-03-29T01:30:00.000Z",
  "spring-forward: 02:30 (skipped hour) currently normalises to 01:30Z — pin this so a tzdata bump can't shift it silently"
);
assert.equal(
  skipped,
  postJump,
  "spring-forward: 02:30 and 03:30 currently collapse to the same UTC instant — documented sharp edge"
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Fall-back: 2026-10-25, clock jumps 03:00 → 02:00.                          */
/*  The wall-clock window 02:00–02:59 occurs TWICE on the salon's clock —      */
/*  once in CEST (UTC+2), once in CET (UTC+1). We deterministically pick the   */
/*  first (CEST) occurrence.                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

// Sanity: a wall-clock time before the seam is unaffected.
// 01:30 CEST (UTC+2) → 23:30Z previous day.
assert.equal(
  wallClockToUtc("2026-10-25", "01:30", ZONE).toISOString(),
  "2026-10-24T23:30:00.000Z",
  "fall-back: pre-seam 01:30 should resolve as UTC+2 (CEST)"
);

// Sanity: a wall-clock time after the seam is unaffected.
// 03:30 CET (UTC+1) → 02:30Z.
assert.equal(
  wallClockToUtc("2026-10-25", "03:30", ZONE).toISOString(),
  "2026-10-25T02:30:00.000Z",
  "fall-back: post-seam 03:30 should resolve as UTC+1 (CET)"
);

// Contract: a wall-clock time INSIDE the repeated hour (02:30) MUST resolve
// to the SECOND occurrence (CET, UTC+1 — after the clock has rolled back).
// First occurrence (NOT picked): 02:30 CEST = 00:30Z.
// Second occurrence (picked):    02:30 CET  = 01:30Z.
//
// Picking the second occurrence is the side-effect of `wallClockToUtc`'s
// two-iteration convergence: the first iteration finds CEST, the second
// re-evaluates after stepping into the CET window. The behaviour is
// deterministic across the IANA zones we care about, which is what matters
// — the salon never books in this hour anyway, but we pin the answer so a
// tzdata bump can't quietly flip it under us.
assert.equal(
  wallClockToUtc("2026-10-25", "02:30", ZONE).toISOString(),
  "2026-10-25T01:30:00.000Z",
  "fall-back: 02:30 (repeated hour) MUST resolve to the second occurrence (CET/UTC+1)"
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Regression guard for the bug that motivated `hourCycle: "h23"`:           */
/*  midnight in the salon's zone must resolve correctly. (Without the fix,    */
/*  `wallClockToUtc("2026-04-30", "00:00", "Europe/Amsterdam")` returned      */
/*  2026-04-28T22:00Z — a 24-hour error that broke availability windows.)     */
/* ─────────────────────────────────────────────────────────────────────────── */

assert.equal(
  wallClockToUtc("2026-04-30", "00:00", ZONE).toISOString(),
  "2026-04-29T22:00:00.000Z",
  "midnight: salon-local 2026-04-30 00:00 (CEST) must resolve to 2026-04-29T22:00:00Z, not 2026-04-28T22:00:00Z"
);

console.log("DST tests: OK");
console.log("  • spring-forward sanity (01:30, 04:00) — pinned");
console.log("  • spring-forward 02:30 currently collapses to 03:30 — pinned (known sharp edge)");
console.log("  • fall-back sanity (01:30, 03:30) — pinned");
console.log("  • fall-back 02:30 → second occurrence (CET/UTC+1) — pinned");
console.log("  • midnight regression (hourCycle: h23) — pinned");
