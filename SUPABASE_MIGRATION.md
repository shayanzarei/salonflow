# Supabase migration runbook

Goal: move SoloHub's Postgres from Neon to Supabase with zero data loss and < 5 minutes of downtime. Run this top-to-bottom in order.

> **Before you start.** Set aside ~45 minutes. Don't migrate during peak traffic — pick a quiet window. The actual cutover (step 6) is fast; the rest is preparation that doesn't affect production.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login is easiest).
2. New project:
   - **Region:** `Central EU (Frankfurt) — eu-central-1`. Closest to Dutch tenants and Vercel's `fra1` edge.
   - **Plan:** Free for now. Upgrade to Pro ($25/mo) when you need daily backups.
   - **Database password:** Generate a strong one and save it to your password manager. You'll need it once for the restore, then never again.
3. Wait ~2 minutes for the project to provision.

## 2. Grab the connection strings

In Supabase dashboard → **Project Settings → Database → Connection string**.

You'll see four tabs. You need two of them:

- **`Session pooler` (port 5432)** — used for the one-time restore. Long-lived connection, supports all SQL features including `CREATE EXTENSION`.
- **`Transaction pooler` (port 6543)** — used by the live app. PgBouncer in transaction mode. Required for serverless Next.js so we don't exhaust Postgres connection limits.

Save both. They look like:

```
# Session pooler — for migrations only
postgresql://postgres.xxxxxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

# Transaction pooler — for the live app
postgresql://postgres.xxxxxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Replace `PASSWORD` with the database password from step 1.

## 3. Verify required extensions on Supabase

SoloHub uses two Postgres extensions. Both are pre-enabled on Supabase but verify before you restore — a missing extension turns the restore into a partial mess.

In Supabase dashboard → **SQL Editor** → run:

```sql
SELECT extname, extversion FROM pg_extension WHERE extname IN ('pgcrypto', 'btree_gist');
```

You want two rows back. If `btree_gist` is missing:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 4. Dump the Neon database

On your Mac, in any directory you'll remember:

```bash
# Set your Neon connection string. Get it from the Neon dashboard.
export NEON_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"

# Dump schema + data, no ownership/grants (Supabase has its own role model).
pg_dump "$NEON_URL" \
  --no-owner \
  --no-acl \
  --no-comments \
  --format=plain \
  --file=solohub-backup.sql

# Sanity check — file size and table count
ls -lh solohub-backup.sql
grep -c "^CREATE TABLE" solohub-backup.sql
```

Expect ~10–50 tables and a file size in the low MB. If it's 0 bytes or `pg_dump` printed errors, stop and figure out why before continuing.

> If `pg_dump` complains about version mismatch, install Postgres client tools that match Neon's server version: `brew install libpq && brew link --force libpq`.

## 5. Restore into Supabase

Still on your Mac:

```bash
export SUPABASE_SESSION_URL="postgresql://postgres.xxxxxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Restore. Errors that say "already exists" or "does not exist" for the
# `public` schema or for built-in roles are normal — Supabase has them.
psql "$SUPABASE_SESSION_URL" -v ON_ERROR_STOP=0 -f solohub-backup.sql 2>&1 | tee restore.log
```

After it finishes, verify the row counts match:

```bash
# Count rows in every table — run on both DBs and compare.
PGURL="$NEON_URL" psql -t -c "SELECT schemaname || '.' || tablename, n_live_tup FROM pg_stat_user_tables ORDER BY 1"
PGURL="$SUPABASE_SESSION_URL" psql -t -c "SELECT schemaname || '.' || tablename, n_live_tup FROM pg_stat_user_tables ORDER BY 1"
```

Or just spot-check the critical tables in the Supabase SQL Editor:

```sql
SELECT
  (SELECT COUNT(*) FROM tenants)         AS tenants,
  (SELECT COUNT(*) FROM bookings)        AS bookings,
  (SELECT COUNT(*) FROM services)        AS services,
  (SELECT COUNT(*) FROM staff)           AS staff;
```

These should match what Neon has *right now*. If they don't, dump+restore again — don't proceed.

## 6. Cutover: switch the live app to Supabase

This is the only step that briefly affects production. Do it in this order:

1. **Open Vercel dashboard** → your SoloHub project → **Settings → Environment Variables**.
2. Find `DATABASE_URL`. **Edit, don't add** — paste the **transaction pooler URL** (port 6543).
3. **Save** and **redeploy** the latest production deploy. Don't let traffic hit the old build.
4. While the deploy is going, **freeze writes** on Neon by changing the `DATABASE_URL` in your local `.env.local` to Supabase too — so any local dev session you forget about doesn't write to the dead DB.
5. Once Vercel's deploy is live, **smoke-test in 60 seconds:**
   - Log in as the admin (`shayanzareiy@gmail.com`)
   - Open `/admin/tenants` — list should populate
   - Open one tenant, view its bookings
   - Open a tenant subdomain (`no-company.solohub.nl`) in incognito — should load
   - Try to create a booking from the public site
6. If anything fails: **roll back** by reverting `DATABASE_URL` in Vercel to the Neon URL and redeploying. The data was never touched in this cutover, so rollback is safe.

## 7. Lock in the new setup

Once smoke tests pass and you've watched it for ~30 minutes:

1. **Update CI** — if any GitHub Actions need DB access (they don't right now, but in case you add migrations later): set `DATABASE_URL` as a repo secret pointing to a *separate* Supabase project for CI, never production.
2. **Update local dev** — paste the transaction pooler URL into `.env.local`.
3. **Take a final Neon backup** — `pg_dump` once more for archival, store the .sql file somewhere safe (e.g. iCloud), then **delete the Neon project** so you stop being charged.

## 8. Optional: enable Supabase backups now

Free tier doesn't include daily backups. As soon as the new DB has any real customer data:

1. Upgrade to **Pro plan** ($25/mo) in **Settings → Billing**.
2. Verify daily backups are enabled in **Database → Backups**.
3. Test point-in-time recovery once: create a throwaway row, wait 10 min, "restore to" 5 min ago, verify the row is gone. Then move on.

Don't skip the test. PITR you've never exercised is PITR you don't have.

---

## Things that can go wrong, and what to do

| Symptom | Cause | Fix |
|---|---|---|
| `relation "X" already exists` during restore | You restored once already | Drop the schema and re-restore: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` |
| `extension "btree_gist" does not exist` | Extension was missing when bookings table restored | `CREATE EXTENSION btree_gist;` then re-run just the constraint section, or full re-restore |
| `too many clients already` after cutover | Using port 5432 instead of 6543 | Switch `DATABASE_URL` to the transaction pooler URL |
| Booking creation returns 500 | `bookings_no_overlap` constraint missing | Re-run migration 017 against Supabase |
| Slow queries that were fast on Neon | Missing indexes from `pg_stat_user_indexes` | Run `\di+` in psql against both DBs and compare |

## Checklist (print this)

- [ ] Supabase project created in `eu-central-1`
- [ ] Database password saved
- [ ] Both connection strings saved (session + transaction pooler)
- [ ] `btree_gist` and `pgcrypto` extensions verified on Supabase
- [ ] Neon dump created and sanity-checked
- [ ] Restore completed without fatal errors
- [ ] Row counts match between Neon and Supabase
- [ ] Vercel `DATABASE_URL` updated to transaction pooler
- [ ] Production redeploy completed
- [ ] Smoke tests pass (admin, tenants, bookings, public site)
- [ ] Local `.env.local` updated
- [ ] Final Neon backup archived
- [ ] Neon project deleted
- [ ] Supabase Pro upgrade scheduled (when first real customer onboards)
