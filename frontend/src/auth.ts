import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "./auth.config";
import { authService } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
    async jwt({ token, account, user }) {
      // Credentials login — authService.login already returns { id, email, name }
      if (account?.provider === "credentials" && user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }

      // Google login — exchange Google ID token for a backend JWT
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/google`, {
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
          // leave token.accessToken undefined — protected routes will 401
        }
      }

      return token;
    },
    async session({ session, token }) {
      (session as typeof session & { accessToken?: string }).accessToken =
        token.accessToken as string | undefined;
      return session;
    },
  },
});
