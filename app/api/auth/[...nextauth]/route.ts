import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Comma-separated list of allowed email addresses
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      // Check if user's email is in the allowed list
      if (ALLOWED_EMAILS.length === 0) {
        console.error('⚠️  No ALLOWED_EMAILS configured - denying access');
        return false;
      }

      const isAllowed = ALLOWED_EMAILS.includes(user.email);
      
      if (!isAllowed) {
        console.log(`❌ Access denied for ${user.email}`);
      } else {
        console.log(`✅ Access granted for ${user.email}`);
      }

      return isAllowed;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

