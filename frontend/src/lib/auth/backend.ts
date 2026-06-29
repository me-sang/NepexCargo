import type { AuthService, AuthUser } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("[auth] NEXT_PUBLIC_API_URL is not set — backend auth calls will fail.");
}

type BackendUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

type Envelope<T> = { success: boolean; data?: T; message?: string };
type AuthPayload = Envelope<{ user: BackendUser; token: string }>;
type ForgotPayload = Envelope<{ resetToken: string }>;
type ResetPayload = Envelope<{ message: string }>;

function toAuthUser(user: BackendUser, token: string): AuthUser {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    id: user.id,
    email: user.email,
    name: name || user.email.split("@")[0],
    accessToken: token,
  };
}

async function postAuth(path: string, body: unknown): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const backendAuthService: AuthService = {
  async login({ email, password }) {
    const res = await postAuth("/auth/login", { email, password });
    if (res.status === 401) return null;
    const json = (await res.json().catch(() => null)) as AuthPayload | null;
    if (!res.ok || !json?.success || !json.data) {
      throw new Error(json?.message ?? "Login failed");
    }
    return toAuthUser(json.data.user, json.data.token);
  },

  async signup({ name, email, password }) {
    const [firstName, ...rest] = (name ?? "").trim().split(/\s+/);
    const lastName = rest.join(" ") || undefined;
    const res = await postAuth("/auth/register", {
      email,
      password,
      firstName: firstName || undefined,
      lastName,
    });
    const json = (await res.json().catch(() => null)) as AuthPayload | null;
    if (!res.ok || !json?.success || !json.data) {
      throw new Error(json?.message ?? "Signup failed");
    }
    return toAuthUser(json.data.user, json.data.token);
  },

  async sendResetCode(email) {
    const res = await postAuth("/auth/forgot-password", { email });
    const json = (await res.json().catch(() => null)) as ForgotPayload | null;
    if (!res.ok || !json?.success || !json.data?.resetToken) {
      throw new Error(json?.message ?? "Could not send reset code");
    }
    return { resetToken: json.data.resetToken };
  },

  async resetPassword({ resetToken, otp, newPassword }) {
    const res = await postAuth("/auth/reset-password", { resetToken, otp, newPassword });
    const json = (await res.json().catch(() => null)) as ResetPayload | null;
    if (!res.ok || !json?.success) {
      throw new Error(json?.message ?? "Invalid or expired code");
    }
  },
};
