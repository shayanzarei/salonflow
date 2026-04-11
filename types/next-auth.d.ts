import "next-auth";

declare module 'next-auth' {
  interface Session {
    tenantId: string;
    slug: string;
    isAdmin: boolean;
  }

  interface User {
    tenantId: string;
    slug: string;
    isAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId: string;
    slug: string;
    isAdmin: boolean;
  }
}

