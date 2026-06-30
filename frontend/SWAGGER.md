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

## Shipment / international rates

> Source: `backend/src/common/dto/shipment.dto.ts`, `backend/src/services/rate-check.service.ts`, `backend/src/docs/shipment.docs.ts`. The route **may not appear yet in the published Swagger UI** depending on deploy lag — the contract below is taken directly from the backend code, so it is authoritative.

### `POST /shipment/international/check-rates`

Unauthenticated. Returns rate-card options for an international shipment.

Body:
```json
{
  "sourceLocation": "NP",
  "destinationLocation": "US",
  "locationType": "country",
  "minWeight": 2.5,
  "weightUnit": "kg"
}
```

| Field | Type | Notes |
|---|---|---|
| `sourceLocation` | string | required. **Exactly 2 letters** (ISO-3166-1 alpha-2). Uppercased server-side |
| `destinationLocation` | string | required. **Exactly 2 letters** |
| `locationType` | `"country"` | required literal |
| `minWeight` | number | required. **Strictly > 0** |
| `weightUnit` | `"kg" \| "g" \| "lb" \| "oz" \| "t"` | required. **lowercase** |

`200` success body:
```ts
{
  success: true,
  data: {
    sourceCountry: string,                    // ISO-2
    destinationCountry: string,               // ISO-2
    destinationZone: { id, name } | null,     // null = destination not in any configured zone
    inputWeight: number,
    inputWeightUnit: WeightUnit,
    rates: Array<{
      rateCardId: string,                     // uuid
      name: string | null,                    // e.g. "DOX", "WPX"
      currency: string,                       // 3-letter ISO code
      weightUnit: WeightUnit,
      chargeableWeight: number,               // input converted to the card's unit
      destinationZone: { id, name },
      tier: {
        minWeight: number,
        maxWeight: number | null,             // null = open upper bound
        price: number,                        // per-unit price from the rate card
        flatPrice: number | null,
        total: number                         // price + (flatPrice ?? 0)
      } | null                                // null = weight exceeds all defined tiers
    }>
  }
}
```

Empty / no-coverage cases:
- `destinationZone === null` → no zone configured for the destination country yet (route not offered).
- `destinationZone !== null && rates.length === 0` → zone exists but no active rate cards for this origin → zone pair.
- Per-rate `tier === null` → weight is heavier than every tier defined on that card.

`400` (validation) shape:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "formErrors": [],
    "fieldErrors": { "minWeight": ["…"], "weightUnit": ["…"], "sourceLocation": ["…"], "destinationLocation": ["…"], "locationType": ["…"] }
  }
}
```

Used by: `src/components/sections/QuoteHeroSection.tsx` on `/check-international-shipping-rates`. The frontend hardcodes a small ISO-2 country shortlist; swap for a `/countries` fetch when the backend exposes one.

#### Integration notes — gotchas from wiring this end-to-end

These are the things the deployed Swagger UI did **not** make obvious; you only see them when you read `backend/src/common/dto/shipment.dto.ts` + `services/rate-check.service.ts`.

1. **`sourceLocation` / `destinationLocation` are ISO-2 only.** Zod is `z.string().length(2)` and `.toUpperCase()` is applied server-side. Sending `"Nepal"` or `"NP "` (with a trailing space) returns `400`. The frontend `<select>` puts the ISO-2 in the `value` and the display name in the label so users still pick "Nepal" but the backend gets `"NP"`.
2. **`weightUnit` is the lowercase enum string** (`"kg" | "g" | "lb" | "oz" | "t"`), not the user-facing label. `z.nativeEnum(WeightUnit)` is strict — `"KG"` is rejected. The `<select>` mirrors this: `value="kg"` with label `KG`.
3. **`minWeight` must be `> 0`.** `z.number().positive()` rejects `0`. The input uses `min={0.01}` *and* a JS guard (HTML `min` is advisory only — users can paste `0`).
4. **No auth on this route.** No `Authorization` header needed; sending one is harmless.
5. **Three empty-state branches the renderer must handle** (all return `200`, not `4xx`):
   - `data.destinationZone === null` → destination country has no zone configured. Show "we don't ship there yet" + contact CTA.
   - `data.destinationZone !== null && data.rates.length === 0` → zone exists but no active rate card from this origin to that zone. Show "no rates configured for this lane at this weight".
   - Per-row `rate.tier === null` → weight is above every tier defined on that card. Show "Weight out of range" instead of a price.
6. **Validation envelope shape for surfacing errors** — backend returns `errors.fieldErrors: Record<string, string[]>`. The form picks the first message it finds; do **not** try to map field names back to UI inputs (the field names don't match the UI labels: `minWeight` vs "Parcel Weight", `sourceLocation` vs "Ship From").
7. **`NEXT_PUBLIC_API_URL` already includes `/api/v1`** (`https://sc-api.nepexcargo.com/api/v1`) — so the fetch path is just `/shipment/international/check-rates`, not `/api/v1/shipment/...`. Double-prefix is a recurring mistake on this codebase.
8. **Currency formatting** — `rate.currency` is a 3-letter ISO code (`"USD"`, `"NPR"`, etc.). The frontend renders `${currency} ${total.toFixed(2)}`; switch to `Intl.NumberFormat` if proper locale formatting matters.
9. **`chargeableWeight` ≠ `inputWeight`** when the input unit differs from the rate card's unit. The backend converts via kg as the base. Display it next to the price so users understand the rounding/conversion.

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
