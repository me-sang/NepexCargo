import { backendAuthService } from "./backend";
import type { AuthService } from "./types";

/**
 * Active auth implementation. Backed by the Nepex Cargo Express API at
 * `${NEXT_PUBLIC_API_URL}/auth/*`. Swap to `stubAuthService` here for
 * offline/dev work.
 */
export const authService: AuthService = backendAuthService;

export type { AuthService, AuthUser, LoginInput, SignupInput, ResetPasswordInput } from "./types";
