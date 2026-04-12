import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // check tenants first (salon owners + admins)
        const tenantResult = await pool.query(
          `SELECT * FROM tenants WHERE slug = $1`,
          [credentials.email]
        );

        if (tenantResult.rows[0]) {
          const tenant = tenantResult.rows[0];
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            tenant.password_hash
          );
          if (!passwordMatch) return null;

          return {
            id: tenant.id,
            name: tenant.name,
            email: tenant.slug,
            tenantId: tenant.id,
            slug: tenant.slug,
            isAdmin: Boolean(tenant.is_admin),
            isStaff: false,
            staffId: null,
          };
        }

        // check staff members
        const staffResult = await pool.query(
          `SELECT s.*, t.slug AS tenant_slug
           FROM staff s
           JOIN tenants t ON s.tenant_id = t.id
           WHERE s.email = $1`,
          [credentials.email]
        );

        if (staffResult.rows[0]) {
          const staff = staffResult.rows[0];
          if (!staff.password_hash) return null;

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            staff.password_hash
          );
          if (!passwordMatch) return null;

          return {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            tenantId: staff.tenant_id,
            slug: staff.email,
            isAdmin: false,
            isStaff: true,
            staffId: staff.id,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.slug = (user as any).slug;
        token.isAdmin = Boolean((user as any).isAdmin);
        token.isStaff = Boolean((user as any).isStaff);
        token.staffId = (user as any).staffId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).tenantId = token.tenantId;
        (session as any).slug = token.slug;
        (session as any).isAdmin = token.isAdmin;
        (session as any).isStaff = token.isStaff;
        (session as any).staffId = token.staffId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
