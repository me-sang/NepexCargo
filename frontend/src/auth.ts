import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "./auth.config";
import { authService } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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
    async jwt({ token, account, user }) {
      // Credentials login — authService.login returned an AuthUser with accessToken.
      if (account?.provider === "credentials" && user) {
        if ("accessToken" in user && typeof user.accessToken === "string") {
          token.accessToken = user.accessToken;
        }
      }

      // Google login — exchange the Google ID token for a backend JWT.
      // NEXT_PUBLIC_API_URL already includes /api/v1, so the path is just /auth/google.
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
          });
          if (res.ok) {
            const data = (await res.json()) as {
              data?: { token?: string; user?: { id?: string; email?: string } };
            };
            token.accessToken = data.data?.token;
            token.sub = data.data?.user?.id ?? token.sub;
          }
        } catch {
          // Leave token.accessToken undefined — backend calls will 401.
        }
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
