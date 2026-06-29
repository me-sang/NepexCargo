# User Password Reset via OTP — Design Spec

**Date:** 2026-06-28
**Status:** Approved

---

## Overview

Add forgot-password and reset-password flows for users. The user receives a 6-digit OTP by email and the client receives a reset token. Both must be presented together to reset the password. Email is sent via a tenant-scoped email integration (Resend or SMTP) whose credentials are stored in `TenantConfiguration`.

---

## Decisions

| Question | Decision |
|----------|----------|
| OTP storage | Postgres columns on `users` table |
| Reset token storage | Postgres columns on `users` table (SHA-256 hash) |
| Email config storage | `TenantConfiguration` (same pattern as Stripe/FedEx/DHL) |
| Email provider selection | Per-tenant, resolved at send time from DB |
| Consumer credential fetch | Consumer fetches tenant config from DB (credentials never in queue) |
| `tenantId` on User | Added as nullable FK; existing users unaffected |

---

## Data Model

### Migration: `AddTenantAndPasswordResetToUsers`

New columns on `users`:

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `tenantId` | `uuid` | yes | FK → `tenants.id` |
| `otpHash` | `varchar` | yes | bcrypt hash of 6-digit OTP |
| `otpExpiresAt` | `timestamp` | yes | 10-minute TTL |
| `resetTokenHash` | `varchar` | yes | SHA-256 of the token sent to client |
| `resetTokenExpiresAt` | `timestamp` | yes | 10-minute TTL |

**Hashing rationale:**
- OTP (6 digits, ~1M search space) → bcrypt to resist brute force
- Reset token (32 random bytes, 2²⁵⁶ search space) → SHA-256 is sufficient and fast

### `TenantConfigProvider` enum additions

```ts
RESEND = 'Resend'
SMTP   = 'SMTP'
```

### Email credentials shape (stored in `TenantConfiguration.credentials` JSONB)

**Resend:**
```json
{ "apiKey": "re_...", "fromEmail": "no-reply@example.com", "fromName": "Nepex Cargo" }
```

**SMTP:**
```json
{
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "user": "smtp-user",
  "password": "smtp-pass",
  "fromEmail": "no-reply@example.com",
  "fromName": "Nepex Cargo"
}
```

---

## API Endpoints

Both routes mount under `/api/v1/auth/` (existing user auth prefix).

### `POST /api/v1/auth/forgot-password`

**Request body:**
```json
{ "email": "user@example.com" }
```

**Response `200`:**
```json
{ "success": true, "data": { "resetToken": "a3f9c2...64b2" } }
```

**Behaviour:**
1. Look up user by email.
2. If not found, or user has no `tenantId` (not yet assigned to a tenant) → return `200` with a dummy token (prevents user enumeration; no email sent).
3. Generate 6-digit numeric OTP via `crypto.randomInt(100000, 999999)`.
4. bcrypt-hash OTP; set `otpHash` + `otpExpiresAt = now + 10 min`.
5. Generate 32-byte random hex token via `crypto.randomBytes(32).toString('hex')`.
6. SHA-256-hash token; set `resetTokenHash` + `resetTokenExpiresAt = now + 10 min`.
7. Save user.
8. Enqueue email job `{ to, subject, html, tenantId }`.
9. Return raw reset token to client.

### `POST /api/v1/auth/reset-password`

**Request body:**
```json
{ "resetToken": "a3f9c2...64b2", "otp": "482910", "newPassword": "newpass123" }
```

`newPassword` validated: min 8 characters (matches registration rule).

**Response `200`:**
```json
{ "success": true, "data": { "message": "Password reset successfully" } }
```

**Behaviour:**
1. SHA-256-hash the incoming `resetToken`; find user by `resetTokenHash`.
2. If not found or `resetTokenExpiresAt` has passed → `400` generic error.
3. bcrypt-compare `otp` against `otpHash`; check `otpExpiresAt`.
4. If OTP invalid or expired → `400` generic error.
5. bcrypt-hash `newPassword`; update `password`.
6. Clear `otpHash`, `otpExpiresAt`, `resetTokenHash`, `resetTokenExpiresAt`.
7. Save user; return success.

**Error responses** (both endpoints use the same generic message to prevent enumeration):
```json
{ "success": false, "message": "Invalid or expired reset token" }
```

---

## Email Integration

### File structure

```
src/integrations/email/
├── email.types.ts     # EmailConfig, EmailMessage interfaces
├── email.client.ts    # EmailClient interface, ResendEmailClient, SmtpEmailClient, createEmailClient factory
├── email.service.ts   # EmailService — renders OTP email, delegates to client
└── index.ts           # re-exports
```

### `email.types.ts`

```ts
interface EmailConfig {
  provider: TenantConfigProvider  // RESEND or SMTP
  credentials: Record<string, unknown>
}

interface EmailMessage {
  to: string
  subject: string
  html: string
  fromEmail: string
  fromName: string
}
```

### `email.client.ts`

```ts
interface EmailClient {
  send(message: EmailMessage): Promise<void>
}

class ResendEmailClient implements EmailClient  // uses `resend` npm SDK
class SmtpEmailClient implements EmailClient    // uses `nodemailer`

function createEmailClient(config: EmailConfig): EmailClient
// Reads config.provider (TenantConfigProvider enum), returns correct implementation
```

### `email.service.ts`

```ts
class EmailService {
  constructor(private readonly client: EmailClient) {}
  async sendOtp(to: string, otp: string): Promise<void>
  // Builds subject + HTML and calls client.send()
}
```

### Email consumer (updated)

`src/queues/consumers/email.consumer.ts` — job payload: `{ to, subject, html, tenantId }`:

1. Fetch `TenantConfiguration` where `tenantId = job.tenantId AND configType = 'email' AND enabled = true`, order by `priority ASC`, take first.
2. If no config found → log error, fail job (no retry — no config means nothing to retry against).
3. `createEmailClient({ provider: config.provider, credentials: config.credentials })`.
4. `new EmailService(client).send({ to, subject, html, fromEmail, fromName })`.

### Email producer (updated)

`EmailJobData` gains `tenantId: string`.

---

## Full File Change Map

### New files
| File | Purpose |
|------|---------|
| `src/integrations/email/email.types.ts` | Shared types |
| `src/integrations/email/email.client.ts` | Client interface + two drivers + factory |
| `src/integrations/email/email.service.ts` | OTP email rendering + send |
| `src/integrations/email/index.ts` | Re-exports |

### Modified files
| File | Change |
|------|--------|
| `src/common/enums/tenant.enums.ts` | Add `RESEND`, `SMTP` to `TenantConfigProvider` |
| `src/database/entities/user.entity.ts` | Add 5 new columns |
| `src/database/migrations/` | New migration `AddTenantAndPasswordResetToUsers` |
| `src/database/repositories/user.repository.ts` | Add `findByResetTokenHash(hash)` |
| `src/services/user.service.ts` | Add `forgotPassword()`, `resetPassword()` |
| `src/controllers/user.controller.ts` | Add two handlers |
| `src/routes/v1/user.routes.ts` | Mount two new routes |
| `src/common/dto/auth.dto.ts` | Add `forgotPasswordSchema`, `resetPasswordSchema` |
| `src/queues/consumers/email.consumer.ts` | Implement actual send logic |
| `src/queues/producers/email.producer.ts` | Add `tenantId` to `EmailJobData` |
| `src/integrations/index.ts` | Re-export email integration |
| `src/docs/user.docs.ts` | Swagger for 2 new endpoints |

### Dependencies to install
| Package | Purpose |
|---------|---------|
| `resend` | Resend SDK |
| `nodemailer` | SMTP transport |
| `@types/nodemailer` | TypeScript types for nodemailer |

---

## Security Notes

- Reset token and OTP both expire after 10 minutes.
- Reset token is hashed (SHA-256) in the DB; raw value only ever sent to the client once.
- OTP is hashed (bcrypt) in the DB; raw value only ever sent via email.
- All error responses for invalid/expired tokens use the same message to prevent enumeration.
- `forgotPassword` always returns `200` even when the email is not found.
- After a successful reset, all reset fields are cleared to prevent token reuse.
