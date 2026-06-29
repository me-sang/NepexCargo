import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "./auth.config";
import { authService } from "@/lib/auth";

// Backend JWT expires after 7 days — keep the Auth.js session in sync so the
// cookie and the accessToken it carries die together (avoids silent backend
// 401s after day 7 while the FE still thinks the user is signed in).
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: SEVEN_DAYS_SECONDS },
  jwt: { maxAge: SEVEN_DAYS_SECONDS },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        return await authService.login({ email, password });
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user && "accessToken" in user && typeof user.accessToken === "string") {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
