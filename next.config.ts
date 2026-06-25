import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /**
   * Routes use `app/(booking)/…`, `app/(dashboard)/…` (route groups), so URLs are
   * already `/`, `/book`, `/staff`, `/calendar`, `/gallery`, etc.
   */
  images: {
    // All user uploads land in Vercel Blob (see app/api/uploads/route.ts).
    // next/image will refuse external URLs unless their host is allow-listed
    // here, so service-card photos won't render without these entries.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    // Multiple lockfiles exist one level up, so pin Turbopack's workspace root
    // to this project directory to keep CSS/module resolution local.
    root: configDir,
  },
};

export default nextConfig;
