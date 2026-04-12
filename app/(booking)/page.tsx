import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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
  if (!tenant) redirect('/login');

  const [servicesResult, staffResult, reviewsResult, sections] =
    await Promise.all([
      pool.query(
        `SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`,
        [tenant.id]
      ),
      pool.query(
        `SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`,
        [tenant.id]
      ),
      pool.query(
        `SELECT * FROM reviews WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 4`,
        [tenant.id]
      ),
      getSectionFlags(tenant.id),
    ]);

  const services = servicesResult.rows;
  const staffList = staffResult.rows;
  const reviews = reviewsResult.rows;
  const brand = tenant.primary_color ?? '#7C3AED';

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>

      {/* Hero */}
      {sections.section_hero && (
        <section
          className="min-h-[90vh] flex items-center"
          style={{ backgroundColor: '#FAF7F4' }}
        >
          <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            <div>
              <p
                className="text-xs tracking-widest uppercase mb-5"
                style={{ color: '#9C7B5A' }}
              >
                Premium hair salon
              </p>
              <h1 className="text-5xl lg:text-6xl font-medium text-gray-900 leading-tight mb-6">
                {tenant.tagline ?? `Welcome to ${tenant.name}`}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
                Experience the finest hair care in a space designed for relaxation, luxury, and transformation.
              </p>
              <div className="flex gap-4 flex-wrap">

                <Link href="/book"
                  className="px-8 py-4 rounded-full text-white font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: brand }}
                >
                  Book an appointment
                </Link>

                <Link href="#services"
                  className="px-8 py-4 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-white transition-colors"
                >
                  View services
                </Link>
              </div>
            </div>
            <div
              className="h-96 lg:h-[500px] rounded-3xl overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: '#E8DDD4' }}
            >
              {tenant.hero_image_url ? (
                <img
                  src={tenant.hero_image_url}
                  alt={tenant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-sm" style={{ color: '#B8A898' }}>
                  Add a hero image in settings
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats bar */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '8+', label: 'Years of experience' },
            { value: '2,400+', label: 'Happy clients' },
            { value: '4.9', label: 'Average rating' },
            { value: `${staffList.length}`, label: 'Expert stylists' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-white text-2xl font-medium">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {sections.section_services && services.length > 0 && (
        <section id="services" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#9C7B5A' }}>
              What we offer
            </p>
            <h2 className="text-4xl font-medium text-gray-900 mb-14">Our services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-7 rounded-2xl border transition-shadow hover:shadow-sm"
                  style={{ backgroundColor: '#FAF7F4', borderColor: '#F0EBE4' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 text-lg">{service.name}</h3>
                    <span className="font-medium text-lg" style={{ color: brand }}>
                      ${service.price}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-gray-500 text-sm mb-2">{service.description}</p>
                  )}
                  <p className="text-gray-400 text-xs mb-6">{service.duration_mins} mins</p>
                  <Link
                    href={`/book/staff?service=${service.id}`}
                    className="block text-center py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: brand }}
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {sections.section_team && staffList.length > 0 && (
        <section id="team" className="py-24" style={{ backgroundColor: '#FAF7F4' }}>
          <div className="max-w-6xl mx-auto px-8">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#9C7B5A' }}>
              Meet the team
            </p>
            <h2 className="text-4xl font-medium text-gray-900 mb-14">Our stylists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {staffList.map((member) => (
                <div key={member.id} className="text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-medium mx-auto mb-4"
                    style={{ backgroundColor: brand }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-gray-500 text-sm mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {sections.section_reviews && (
        <section id="reviews" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#9C7B5A' }}>
              What clients say
            </p>
            <h2 className="text-4xl font-medium text-gray-900 mb-14">Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reviews.length > 0 ? reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-7 rounded-2xl border"
                  style={{ borderColor: '#F0EBE4' }}
                >
                  <p className="text-sm mb-4" style={{ color: '#9C7B5A' }}>
                    {'★'.repeat(review.rating)}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    &quot;{review.comment}&quot;
                  </p>
                  <p className="font-medium text-gray-900 text-sm">{review.client_name}</p>
                </div>
              )) : (
                <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {sections.section_about && tenant.about && (
        <section className="py-24" style={{ backgroundColor: '#FAF7F4' }}>
          <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div
              className="h-80 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: '#E8DDD4' }}
            >
              <p className="text-sm" style={{ color: '#B8A898' }}>Salon photo</p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#9C7B5A' }}>
                Our story
              </p>
              <h2 className="text-4xl font-medium text-gray-900 mb-6">About us</h2>
              <p className="text-gray-500 leading-relaxed">{tenant.about}</p>
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {sections.section_contact && (
        <section id="contact" className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-medium text-white mb-3">Ready to book?</h2>
              {tenant.address && (
                <p className="text-gray-400 text-sm">{tenant.address}</p>
              )}
              {tenant.hours && (
                <p className="text-gray-400 text-sm mt-1">{tenant.hours}</p>
              )}
            </div>

            <Link href="/book"
              className="px-8 py-4 rounded-full text-white font-medium text-sm transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: brand }}
            >
              Book now
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black py-6">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <p className="text-gray-600 text-xs">© 2026 {tenant.name}</p>
          <p className="text-gray-700 text-xs">Powered by SalonFlow</p>
        </div>
      </footer>
    </div>
  );
}