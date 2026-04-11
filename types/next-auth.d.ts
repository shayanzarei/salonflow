import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    tenantId?: string;
    slug?: string;
    user: DefaultSession["user"] & { tenantId?: string; slug?: string };
  }

  interface User {
    tenantId?: string;
    slug?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string;
    slug?: string;
  }
}
