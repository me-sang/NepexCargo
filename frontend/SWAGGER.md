# Backend API reference (for the frontend)

Source of truth: `https://sc-api.nepexcargo.com/api/docs/` (Swagger UI), spec at `https://sc-api.nepexcargo.com/api/docs/swagger.json`. This file is a snapshot — re-fetch the spec if anything feels stale.

## Base

- **Base URL (prod):** `https://sc-api.nepexcargo.com/api/v1`
- **Set `NEXT_PUBLIC_API_URL` to that** — note the `/api/v1`, not just `/api`.
- **Auth scheme:** `Authorization: Bearer <jwt>` (`BearerAuth` security in the spec)
- **Response envelope:**
  - Success: `{ success: true, data: <T> }` (sometimes `201` for created)
  - Failure: `{ success: false, message: string, errors?: unknown }`

---

## User auth (the surface NextAuth talks to)

All paths below are relative to the base URL.

### `POST /auth/register`
Register a new user. Auto-issues a JWT — no separate login call needed.

Body:
```json
{ "email": "user@example.com", "password": "min 8 chars", "firstName": "Jane?", "lastName": "Smith?" }
```
`201` → `{ success: true, data: { user: UserResponse, token: "eyJ..." } }`
`409` → email already in use.

### `POST /auth/login`
Body:
```json
{ "email": "user@example.com", "password": "..." }
```
`200` → `{ success: true, data: { user, token } }`
`401` → invalid credentials. **Map this to `return null` in the Credentials provider** (not throw).

### `GET /auth/me` — Bearer
`200` → `{ success: true, data: UserResponse }`
`401` → token missing/invalid/expired.

### `POST /auth/forgot-password`
Always responds 200 (anti-enumeration). Returns a one-shot `resetToken` that's required for the next step.

Body: `{ "email": "user@example.com" }`
`200` → `{ success: true, data: { resetToken: "a3f9c2...64b2" } }`

### `POST /auth/reset-password`
Body:
```json
{ "resetToken": "<from forgot-password>", "otp": "482910", "newPassword": "min 8 chars" }
```
Important:
- **OTP is exactly 6 digits** (`pattern: ^\d{6}$`). Our current UI has 4 boxes — needs to grow to 6.
- **No separate `/verify` endpoint.** The OTP is checked atomically with the password change. Our current OTP screen has nowhere to verify against; either remove the "Continue" button's server hop and just stash the OTP in sessionStorage, or call a backend that doesn't exist.

`200` → `{ success: true, data: { message: "Password reset successfully" } }`
`400` → invalid/expired token or OTP.

### `UserResponse` shape
```ts
{ id: uuid, email: string, firstName: string | null, lastName: string | null, createdAt, updatedAt }
```
No `name` field — frontend composes from firstName + lastName.

---

## Super-admin auth (separate surface, not used by the public site)

Same envelope, different path. Listed for awareness only — the public marketing site/auth flow should not call these.

| Path | Method | Notes |
|---|---|---|
| `/admin/auth/login` | POST | Body `{ email, password }`, returns `{ admin, token }` |
| `/admin/auth/me` | GET | Bearer; returns current admin |
| `/admin/auth/create` | POST | Bearer; creates another super admin |

---

## Frontend wiring (current)

- `src/lib/auth/backend.ts` — calls `/auth/{login,register,forgot-password,reset-password}` relative to `NEXT_PUBLIC_API_URL`.
- `src/lib/auth/index.ts` — `export const authService = backendAuthService` (stub kept around only for offline dev).
- Reset flow session keys: `nepex.reset.email` (display only), `nepex.reset.token` (from `/auth/forgot-password`), `nepex.reset.otp` (the 6 digits). All three cleared after a successful reset.
- `/api/auth/*` proxy routes thinly forward to `authService` — the only reason they exist is so future server-side logic (cookies, logging) has a hook.

## Known gaps

- **Single Full Name field on signup** — `backend.ts` splits on whitespace; "Jane" with no surname sends `firstName: "Jane"` and no `lastName`. Long names like "María del Carmen Pérez" assign `firstName: "María"` and `lastName: "del Carmen Pérez"`. Split into two fields if better fidelity is needed.
- **Google sign-in** — the Auth.js provider is wired but the backend doesn't accept a Google-issued token yet; OAuth users will only have a NextAuth-side session, no backend JWT.
- **`accessToken` is on the NextAuth session but nothing in the FE consumes it yet.** Authenticated calls to other backend routes need a small fetch helper that reads `session.accessToken` and adds `Authorization: Bearer …`.
