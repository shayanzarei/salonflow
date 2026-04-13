import { BookingPublicNav } from "@/components/booking/BookingPublicNav";
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
      <BookingPublicNav
        brand={brand}
        salonName={tenant.name}
        bookHref="/book"
      />
      {children}
    </>
  );
}
