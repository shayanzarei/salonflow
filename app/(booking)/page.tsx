import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";

async function getSectionFlags(tenantId: string) {
  const result = await pool.query(
    `SELECT feature, enabled FROM feature_flags
     WHERE tenant_id = $1 AND feature LIKE 'section_%'`,
    [tenantId]
  );
  const map: Record<string, boolean> = {
    section_hero: true,
    section_services: true,
    section_team: true,
    section_gallery: true,
    section_reviews: true,
    section_about: true,
    section_contact: true,
  };
  result.rows.forEach((row) => {
    map[row.feature] = row.enabled;
  });
  return map;
}

export default async function BookingHomePage() {
  const tenant = await getTenant();
  if (!tenant) redirect("/login");

  const [servicesResult, staffResult, reviewsResult, sections] =
    await Promise.all([
      pool.query(`SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`, [
        tenant.id,
      ]),
      pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
        tenant.id,
      ]),
      pool.query(
        `SELECT * FROM reviews WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 4`,
        [tenant.id]
      ),
      getSectionFlags(tenant.id),
    ]);

  const services = servicesResult.rows;
  const staffList = staffResult.rows;
  const reviews = reviewsResult.rows;
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "white" }}>
      {/* Hero */}
      {sections.section_hero && (
        <section style={{ background: "white", padding: "80px 0 100px" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#F5F3FF",
                  borderRadius: 100,
                  padding: "6px 14px",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 12, color: brand }}>✦</span>
                <span style={{ fontSize: 12, color: brand, fontWeight: 500 }}>
                  Premium Beauty Experience
                </span>
              </div>
              <h1
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#0f0f0f",
                  lineHeight: 1.1,
                  margin: "0 0 20px",
                }}
              >
                {tenant.tagline ? (
                  tenant.tagline
                ) : (
                  <>
                    Elevate your
                    <br />
                    <span style={{ color: brand }}>natural beauty</span>
                  </>
                )}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: "#666",
                  lineHeight: 1.7,
                  margin: "0 0 36px",
                  maxWidth: 420,
                }}
              >
                Experience luxury treatments tailored to your unique style. Book
                your appointment seamlessly and discover the ultimate salon
                experience.
              </p>
              <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
                <a
                  href="/book"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    background: brand,
                    color: "white",
                    borderRadius: 100,
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Book an Appointment →
                </a>

                <a
                  href="#services"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "14px 28px",
                    border: "1px solid #e5e7eb",
                    color: "#333",
                    borderRadius: 100,
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  View Services
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>
                  {["A", "B", "C", "D"].map((l, i) => (
                    <div
                      key={l}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: brand,
                        border: "2px solid white",
                        marginLeft: i > 0 ? -8 : 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {l}
                    </div>
                  ))}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      border: "2px solid white",
                      marginLeft: -8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#666",
                      fontWeight: 600,
                    }}
                  >
                    +2k
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ color: "#F59E0B", fontSize: 14 }}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                    4.9/5 from 2,000+ reviews
                  </p>
                </div>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "#f3f0ed",
                  height: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tenant.hero_image_url ? (
                  <img
                    src={tenant.hero_image_url}
                    alt={tenant.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <p style={{ color: "#B8A898", fontSize: 14 }}>
                    Add a hero image in settings
                  </p>
                )}
              </div>
              {/* Next available card */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 24,
                  right: 24,
                  background: "white",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#999",
                      margin: "0 0 4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Next Available
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#111",
                      margin: 0,
                    }}
                  >
                    Today, 2:30 PM
                  </p>
                </div>

                <a
                  href="/book"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: brand,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textDecoration: "none",
                    fontSize: 18,
                  }}
                >
                  →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats bar */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid #f3f4f6",
          borderBottom: "1px solid #f3f4f6",
          padding: "40px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 40px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
          }}
        >
          {[
            { value: "8+", label: "Years Experience" },
            { value: "2,400+", label: "Happy Clients" },
            { value: "4.9", label: "Average Rating" },
            { value: `${staffList.length}`, label: "Expert Stylists" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                borderRight: i < 3 ? "1px solid #f3f4f6" : "none",
                padding: "0 24px",
              }}
            >
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 6px",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {sections.section_services && services.length > 0 && (
        <section
          id="services"
          style={{ padding: "100px 0", background: "white" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 48,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 12px",
                  }}
                >
                  Our Services
                </p>
                <h2
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 12px",
                  }}
                >
                  Signature Services
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "#888",
                    margin: 0,
                    maxWidth: 400,
                  }}
                >
                  Tailored treatments designed to enhance your natural beauty
                  and provide ultimate relaxation.
                </p>
              </div>
              <a
                href="/book"
                style={{
                  fontSize: 14,
                  color: brand,
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                View All Services →
              </a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
              }}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 20,
                    overflow: "hidden",
                    background: "white",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Service image placeholder */}
                  <div
                    style={{
                      height: 200,
                      background: "#f8f7f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <p style={{ color: "#ccc", fontSize: 13 }}>Service photo</p>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: brand,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            margin: "0 0 6px",
                            fontWeight: 500,
                          }}
                        >
                          Hair Care
                        </p>
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#111",
                            margin: 0,
                          }}
                        >
                          {service.name}
                        </h3>
                      </div>
                      <span
                        style={{ fontSize: 16, fontWeight: 700, color: "#111" }}
                      >
                        €{service.price}
                      </span>
                    </div>
                    {service.description && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#888",
                          lineHeight: 1.6,
                          margin: "8px 0 16px",
                        }}
                      >
                        {service.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <p style={{ fontSize: 13, color: "#999", margin: 0 }}>
                        ⏱ {service.duration_mins} min
                      </p>

                      <a
                        href={`/book/staff?service=${service.id}`}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: `1px solid ${brand}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: brand,
                          textDecoration: "none",
                          fontSize: 18,
                          fontWeight: 300,
                        }}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {sections.section_team && staffList.length > 0 && (
        <section
          id="team"
          style={{ padding: "100px 0", background: "#fafafa" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 12px",
                }}
              >
                Our Experts
              </p>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                }}
              >
                Meet Our Team
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(staffList.length, 4)}, 1fr)`,
                gap: 32,
              }}
            >
              {staffList.map((member) => (
                <div key={member.id} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: brand,
                      margin: "0 auto 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 40,
                      fontWeight: 600,
                    }}
                  >
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: "#111",
                      margin: "0 0 6px",
                    }}
                  >
                    {member.name}
                  </h3>
                  <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {sections.section_reviews && (
        <section
          id="reviews"
          style={{ padding: "100px 0", background: "white" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 12px",
                }}
              >
                Testimonials
              </p>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                }}
              >
                What Our Clients Say
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 24,
              }}
            >
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: 32,
                      border: "1px solid #f0f0f0",
                      borderRadius: 20,
                      background: "white",
                    }}
                  >
                    <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span
                          key={i}
                          style={{ color: "#F59E0B", fontSize: 16 }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#444",
                        lineHeight: 1.7,
                        margin: "0 0 20px",
                      }}
                    >
                      "{review.comment}"
                    </p>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: brand,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {review.client_name.charAt(0)}
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#111",
                          margin: 0,
                        }}
                      >
                        {review.client_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#ccc",
                    fontSize: 14,
                  }}
                >
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {sections.section_about && tenant.about && (
        <section
          id="about"
          style={{ padding: "100px 0", background: "#fafafa" }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                background: "#f0ebe4",
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#B8A898", fontSize: 14 }}>Salon photo</p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 12px",
                }}
              >
                Our Story
              </p>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 20px",
                }}
              >
                About {tenant.name}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "#666",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {tenant.about}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      {sections.section_contact && (
        <section
          id="contact"
          style={{ padding: "80px 40px", background: "#111" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                background: brand,
                borderRadius: 24,
                padding: "60px 80px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "white",
                  margin: "0 0 16px",
                }}
              >
                Ready for your transformation?
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.8)",
                  margin: "0 0 36px",
                }}
              >
                Book your appointment today and let our expert team enhance your
                natural beauty in our luxurious, relaxing environment.
              </p>

              <a
                href="/book"
                style={{
                  display: "inline-block",
                  padding: "14px 36px",
                  background: "white",
                  color: brand,
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Book Now
              </a>
            </div>
            {(tenant.address || tenant.hours) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 40,
                  marginTop: 40,
                }}
              >
                {tenant.address && (
                  <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
                    📍 {tenant.address}
                  </p>
                )}
                {tenant.hours && (
                  <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
                    🕐 {tenant.hours}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: "#0a0a0a", padding: "60px 0 30px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 60,
              marginBottom: 60,
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
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
                <span style={{ color: "white", fontWeight: 600, fontSize: 16 }}>
                  {tenant.name}
                </span>
              </div>
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: 240,
                }}
              >
                Your premium destination for luxury beauty treatments.
                Experience the perfect blend of expertise and relaxation.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  margin: "0 0 20px",
                }}
              >
                Services
              </h4>
              {services.slice(0, 5).map((s) => (
                <a
                  key={s.id}
                  href={`/book/staff?service=${s.id}`}
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: 14,
                    textDecoration: "none",
                    marginBottom: 10,
                  }}
                >
                  {s.name}
                </a>
              ))}
            </div>

            {/* Company */}
            <div>
              <h4
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  margin: "0 0 20px",
                }}
              >
                Company
              </h4>
              {["About Us", "Our Team", "Reviews", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: 14,
                    textDecoration: "none",
                    marginBottom: 10,
                  }}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  margin: "0 0 20px",
                }}
              >
                Contact
              </h4>
              {tenant.address && (
                <p style={{ color: "#666", fontSize: 14, margin: "0 0 10px" }}>
                  📍 {tenant.address}
                </p>
              )}
              {tenant.hours && (
                <p style={{ color: "#666", fontSize: 14, margin: "0 0 10px" }}>
                  🕐 {tenant.hours}
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #1a1a1a",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ color: "#444", fontSize: 13, margin: 0 }}>
              © 2026 {tenant.name}. All rights reserved.
            </p>
            <p style={{ color: "#333", fontSize: 13, margin: 0 }}>
              Powered by SalonFlow
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
