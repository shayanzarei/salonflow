import { getTenant } from "@/lib/tenant";
import Link from "next/link";

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  if (!tenant) {
    return <>{children}</>;
  }

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid #f0ebe4",
        }}>
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "0 32px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: tenant.primary_color ?? "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 500,
                fontSize: 14,
              }}>
              {tenant.name.charAt(0)}
            </div>
            <span style={{ fontWeight: 500, fontSize: 15, color: "#1a1a1a" }}>
              {tenant.name}
            </span>
          </div>
          <div
            style={{ display: "flex", gap: 32, fontSize: 14, color: "#666" }}>
            <a
              href="#services"
              style={{ color: "#666", textDecoration: "none" }}>
              Services
            </a>
            <a href="#team" style={{ color: "#666", textDecoration: "none" }}>
              Team
            </a>
            <a
              href="#reviews"
              style={{ color: "#666", textDecoration: "none" }}>
              Reviews
            </a>
            <a href="#about" style={{ color: "#666", textDecoration: "none" }}>
              About
            </a>
          </div>

          <Link
            href="/book"
            style={{
              padding: "10px 24px",
              background: tenant.primary_color ?? "#7C3AED",
              color: "white",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}>
            Book now
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
