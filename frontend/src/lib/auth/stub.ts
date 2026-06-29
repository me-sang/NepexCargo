import type { AuthService } from "./types";

/**
 * In-memory stub. Kept for tests / offline dev. Production code uses
 * `backendAuthService`; see `./index.ts`.
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
    return { resetToken: "stub-token" };
  },

  async resetPassword({ resetToken, otp, newPassword }) {
    if (!resetToken || !/^\d{6}$/.test(otp) || newPassword.length < 8) {
      throw new Error("Invalid payload");
    }
    console.info("[auth-stub] resetPassword");
  },
};
