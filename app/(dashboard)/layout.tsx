import LogoutButton from "@/components/dashboard/LogoutButton";
import SidebarNav from "@/components/dashboard/SidebarNav";
import { authOptions } from "@/lib/auth-options";
import { getTenant } from "@/lib/tenant";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "white",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid #f5f5f5",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {tenant.name.charAt(0).toUpperCase()}
              {tenant.name.split(" ")[1]?.charAt(0).toUpperCase() ?? ""}
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {tenant.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#999",
                  margin: 0,
                  textTransform: "capitalize",
                }}
              >
                {tenant.plan_tier} Plan
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <SidebarNav brandColor={brand} />
        </div>

        {/* Bottom */}
        <div style={{ padding: "12px 12px", borderTop: "1px solid #f5f5f5" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              color: "#666",
              fontSize: 14,
              textDecoration: "none",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 16 }}>🌐</span>
            <span>Help & Support</span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh" }}>
        {/* Top bar */}
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #f0f0f0",
            padding: "0 32px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #f0f0f0",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🔔
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {tenant.name.charAt(0)}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>{children}</div>
      </main>
    </div>
  );
}
