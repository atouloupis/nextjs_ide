import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub({})],
  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign in, persist access_token and user info
      if (account && profile) {
        const prof = profile as any;
        token.accessToken = account.access_token;
        token.name = prof.name || prof.login; // GitHub profile
        token.login = prof.login;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose token and user info to the client
      const typedToken = token as any;
      session.accessToken = typedToken.accessToken;
      session.user.name = typedToken.name;
      session.user.login = typedToken.login;
      return session;
    }
  }
});
