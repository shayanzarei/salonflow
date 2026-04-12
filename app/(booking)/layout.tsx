import { getTenant } from "@/lib/tenant";

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  if (!tenant) {
    return <>{children}</>;
  }

  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 40px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {tenant.name.charAt(0)}
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>
              {tenant.name}
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", gap: 36 }}>
            {["Services", "Team", "Reviews", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: "#555",
                  fontSize: 14,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* <a
              href="/login"
              style={{
                color: "#555",
                fontSize: 14,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Log In
            </a> */}

            <a
              href="/book"
              style={{
                padding: "10px 24px",
                background: brand,
                color: "white",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Book Now
            </a>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
