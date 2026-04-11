import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Edge proxy (formerly middleware). Must be default export or named `proxy`. */
export default function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const slug = host.split(".")[0] ?? "";

  const reserved = [
    "admin",
    "app",
    "www",
    "localhost",
    "localhost:3000",
    "localhost:3001",
    "127",
    "192",
  ];
  if (reserved.includes(slug)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  res.headers.set("x-tenant-slug", slug);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
