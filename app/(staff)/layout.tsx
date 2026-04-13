import { StaffChrome } from "@/components/staff/StaffChrome";
import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const result = await pool.query(
    `SELECT s.*, t.name AS salon_name, t.primary_color
     FROM staff s
     JOIN tenants t ON s.tenant_id = t.id
     WHERE s.email = $1`,
    [(session as { slug?: string }).slug]
  );

  const staffMember = result.rows[0];
  if (!staffMember) redirect("/dashboard");

  const brand = staffMember.primary_color ?? "#7C3AED";

  return (
    <StaffChrome
      brand={brand}
      staffName={staffMember.name}
      salonName={staffMember.salon_name}
    >
      {children}
    </StaffChrome>
  );
}
