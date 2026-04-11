import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

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

        // find tenant by email (we'll use slug as email for now)
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.tenantId) token.tenantId = user.tenantId;
        if (user.slug) token.slug = user.slug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.tenantId) session.tenantId = token.tenantId;
      if (token.slug) session.slug = token.slug;
      if (session.user) {
        if (token.tenantId) session.user.tenantId = token.tenantId;
        if (token.slug) session.user.slug = token.slug;
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