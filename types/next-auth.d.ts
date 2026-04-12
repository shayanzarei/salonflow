import "next-auth";

declare module "next-auth" {
  interface Session {
    tenantId: string;
    slug: string;
    isAdmin: boolean;
    isStaff: boolean;
    staffId: string | null;
  }

  interface User {
    tenantId: string;
    slug: string;
    isAdmin: boolean;
    isStaff: boolean;
    staffId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId: string;
    slug: string;
    isAdmin: boolean;
    isStaff: boolean;
    staffId: string | null;
  }
}
