/**
 * The single surface every auth-related UI/route talks to.
 * Swap the implementation in `./index.ts` when the real backend is wired.
 */

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type LoginInput = { email: string; password: string };
export type SignupInput = { name: string; email: string; password: string };
export type VerifyCodeInput = { email: string; code: string };
export type ResetPasswordInput = {
  email: string;
  code: string;
  password: string;
};

export interface AuthService {
  /** Validate credentials. Return user on success, `null` on failure. */
  login(input: LoginInput): Promise<AuthUser | null>;

  /** Create a new account and return the user. Throw on failure. */
  signup(input: SignupInput): Promise<AuthUser>;

  /** Trigger a password-reset code (e.g. email a 4-digit OTP). */
  sendResetCode(email: string): Promise<void>;

  /** Verify a previously-sent code. Throw on failure. */
  verifyResetCode(input: VerifyCodeInput): Promise<void>;

  /** Persist the new password after a successful verify step. */
  resetPassword(input: ResetPasswordInput): Promise<void>;
}
