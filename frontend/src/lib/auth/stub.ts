import type { AuthService } from "./types";

/**
 * In-memory stub used until the Express backend exposes /auth endpoints.
 *
 * Replace with a real implementation by creating `./backend.ts` that hits
 * `${NEXT_PUBLIC_API_URL}/auth/*` and re-export it from `./index.ts`.
 */
export const stubAuthService: AuthService = {
  async login({ email, password }) {
    if (!email || !password) return null;
    return {
      id: email,
      email,
      name: email.split("@")[0],
      accessToken: "stub",
    };
  },

  async signup({ name, email }) {
    return {
      id: email,
      email,
      name: name || email.split("@")[0],
      accessToken: "stub",
    };
  },

  async sendResetCode(email) {
    console.info("[auth-stub] sendResetCode", email);
  },

  async verifyResetCode({ email, code }) {
    if (!email || !/^\d{4}$/.test(code)) {
      throw new Error("Invalid code");
    }
  },

  async resetPassword({ email, password }) {
    if (!email || password.length < 8) {
      throw new Error("Invalid payload");
    }
    console.info("[auth-stub] resetPassword for", email);
  },
};
