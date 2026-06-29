/**
 * The single surface every auth-related UI/route talks to.
 * Swap the implementation in `./index.ts` when the real backend is wired.
 */

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  accessToken: string;
};

export type LoginInput = { email: string; password: string };
export type SignupInput = { name: string; email: string; password: string };
export type ResetPasswordInput = {
  resetToken: string;
  otp: string;
  newPassword: string;
};

export interface AuthService {
  /** Validate credentials. Return user on success, `null` on failure. */
  login(input: LoginInput): Promise<AuthUser | null>;

  /** Create a new account and return the user. Throw on failure. */
  signup(input: SignupInput): Promise<AuthUser>;

  /**
   * Trigger a password-reset OTP. Returns the one-shot `resetToken` the
   * client must hand back on the reset step. Backend always returns 200
   * (anti-enumeration) — don't surface "no such email" to the UI.
   */
  sendResetCode(email: string): Promise<{ resetToken: string }>;

  /** Atomically verify the OTP and persist the new password. */
  resetPassword(input: ResetPasswordInput): Promise<void>;
}
