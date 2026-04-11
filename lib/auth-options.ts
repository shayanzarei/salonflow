import bcrypt from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

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

        const result = await pool.query(
          `SELECT * FROM tenants WHERE slug = $1`,
          [credentials.email]
        );

        const tenant = result.rows[0];
        if (!tenant) return null;

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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.tenantId) token.tenantId = user.tenantId;
        if (user.slug) token.slug = user.slug;
        token.isAdmin = Boolean(user.isAdmin);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as Session).tenantId = token.tenantId;
        (session as Session).slug = token.slug;
        (session as Session).isAdmin = token.isAdmin;
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
