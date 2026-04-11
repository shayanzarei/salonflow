import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Routes use `app/(booking)/…`, `app/(dashboard)/…` (route groups), so URLs are
   * already `/`, `/book`, `/staff`, etc. Do not rewrite `/` → `/booking` unless you
   * add a real `app/booking/` segment (that path would 404 with groups only).
   */
};

export default nextConfig;
