import { AdminChrome } from "@/components/admin/AdminChrome";
import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const result = await pool.query(
    `SELECT is_admin FROM tenants WHERE slug = $1`,
    [(session.user as { email: string })?.email]
  );

  if (!result.rows[0]?.is_admin) redirect("/dashboard");

  return <AdminChrome>{children}</AdminChrome>;
}
