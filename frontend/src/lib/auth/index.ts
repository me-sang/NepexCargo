import { stubAuthService } from "./stub";
import type { AuthService } from "./types";

/**
 * The active auth implementation.
 * Swap this single export when the real backend is ready, e.g.
 *
 *   import { backendAuthService } from "./backend";
 *   export const authService: AuthService = backendAuthService;
 */
export const authService: AuthService = stubAuthService;

export type { AuthService, AuthUser, LoginInput, SignupInput, VerifyCodeInput, ResetPasswordInput } from "./types";
