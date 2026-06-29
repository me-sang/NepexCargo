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

type BackendAuthPayload = {
  success: boolean;
  data?: { user: BackendUser; token: string };
  message?: string;
};

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
    const res = await postAuth("/users/auth/login", { email, password });
    if (res.status === 401) return null;
    const json = (await res.json().catch(() => null)) as BackendAuthPayload | null;
    if (!res.ok || !json?.success || !json.data) {
      throw new Error(json?.message ?? "Login failed");
    }
    return toAuthUser(json.data.user, json.data.token);
  },

  async signup({ name, email, password }) {
    const [firstName, ...rest] = (name ?? "").trim().split(/\s+/);
    const lastName = rest.join(" ") || undefined;
    const res = await postAuth("/users/auth/register", {
      email,
      password,
      firstName: firstName || undefined,
      lastName,
    });
    const json = (await res.json().catch(() => null)) as BackendAuthPayload | null;
    if (!res.ok || !json?.success || !json.data) {
      throw new Error(json?.message ?? "Signup failed");
    }
    return toAuthUser(json.data.user, json.data.token);
  },

  async sendResetCode() {
    throw new Error("Backend forgot-password endpoint not implemented");
  },

  async verifyResetCode() {
    throw new Error("Backend verify-reset-code endpoint not implemented");
  },

  async resetPassword() {
    throw new Error("Backend reset-password endpoint not implemented");
  },
};
