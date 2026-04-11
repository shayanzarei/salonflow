import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import NextAuth, { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
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
          isAdmin: tenant.is_admin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.tenantId) token.tenantId = user.tenantId;
        if (user.slug) token.slug = user.slug;
        if (user.isAdmin) token.isAdmin = user.isAdmin;
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
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
