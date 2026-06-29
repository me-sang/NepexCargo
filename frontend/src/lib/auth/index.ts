import { backendAuthService } from "./backend";
import { stubAuthService } from "./stub";
import type { AuthService } from "./types";

/**
 * Hybrid: login + signup hit the real backend; the forgot-password trio stays
 * stubbed until the backend ships those endpoints. Drop the stub fallbacks
 * from this object once /forgot-password/* is live.
 */
export const authService: AuthService = {
  login: backendAuthService.login,
  signup: backendAuthService.signup,
  sendResetCode: stubAuthService.sendResetCode,
  verifyResetCode: stubAuthService.verifyResetCode,
  resetPassword: stubAuthService.resetPassword,
};

export type { AuthService, AuthUser, LoginInput, SignupInput, VerifyCodeInput, ResetPasswordInput } from "./types";
