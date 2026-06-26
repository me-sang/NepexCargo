# Nepex Cargo — Super Admin & Partner Dashboard Design

**Date:** 2026-06-26  
**Scope:** Super Admin panel (`admin/`) + Partner/Agent dashboard (`dashboard/`)  
**Status:** Approved for implementation planning

---

## 1. Overview

Nepex Cargo is a multi-tenant SaaS logistics platform. This spec covers two new Next.js applications added to the existing monorepo:

- **`admin/`** — Super Admin panel for platform operators (Nepex Cargo team)
- **`dashboard/`** — Partner dashboard + Agent portal for tenant companies and their branch operators

The existing **`frontend/`** (public site) and **`backend/`** (Node/Express/TypeORM API) are unchanged in structure but the backend gains new entities and routes.

---

## 2. Monorepo Structure

```
nepex-cargo-project/
├── backend/       (existing — API server, serves all three apps)
├── frontend/      (existing — public site)
├── admin/         (NEW — Next.js 16, App Router, Tailwind CSS v4)
├── dashboard/     (NEW — Next.js 16, App Router, Tailwind CSS v4)
└── README.md
```

Each app has its own independent component set — no shared UI library.

---

## 3. URL Structure

| URL | App | Notes |
|-----|-----|-------|
| `nepexcargo.com` | `frontend/` | Public landing, quote form, tracking |
| `{tenant-name}.com` | `frontend/` | White-labeled public site for a partner |
| `admin.nepexcargo.com` | `admin/` | Super Admin only |
| `dashboard.nepexcargo.com` | `dashboard/` | Nepex Cargo's own partner dashboard |
| `dashboard.{tenant-name}.com` | `dashboard/` | Partner dashboard on custom domain |

**Tenant resolution in `dashboard/`:** On each request, middleware reads the `Host` header and looks up the tenant via the `tenant_domain` table (already exists). After login, the JWT carries `tenant_id` + `role` and all API calls are scoped to that tenant.

**Custom domains (future):** Partner adds their domain in `/settings/domain`. DNS verification + SSL provisioning required. The `tenant_domain` table already supports this pattern.

**Local dev:** Use `/etc/hosts` entries — `admin.localhost`, `test-partner.localhost.dashboard` pointing to `127.0.0.1`.

---

## 4. Backend Data Model

### 4.1 Extend Existing Entities

**`Tenant`** — add fields:
- `slug: string` (unique, URL-safe, e.g. `dhl-nepal`) — used for subdomain matching
- `profile_complete: boolean` (default `false`) — gates dashboard access until company profile is filled

### 4.2 New Entities

#### Rate Engine

**`Zone`**
- `id`, `tenant_id` (FK → Tenant)
- `name: string`
- `countries: string[]` (ISO country codes)
- `cities: string[]` (optional city-level granularity)
- `created_at`, `updated_at`

**`RateCard`**
- `id`, `tenant_id` (FK → Tenant)
- `name: string`
- `type: enum` — `zone | route | flat`
- `origin_zone_id` (FK → Zone, nullable)
- `destination_zone_id` (FK → Zone, nullable)
- `origin_country: string` (nullable, used when type = route)
- `destination_country: string` (nullable)
- `origin_city: string` (nullable)
- `destination_city: string` (nullable)
- `integration_id` (FK → TenantIntegration, nullable) — links rate to a specific carrier
- `active: boolean`
- `created_at`, `updated_at`

**`WeightTier`**
- `id`, `rate_card_id` (FK → RateCard)
- `min_kg: decimal`
- `max_kg: decimal` (nullable = "and above")
- `price_per_kg: decimal`
- `flat_price: decimal` (nullable — used for flat-rate tiers)
- `currency: string`

#### Integrations

**`TenantIntegration`**
- `id`, `tenant_id` (FK → Tenant)
- `integration_category: enum` — `delivery | payment`
- `integration_type: enum` — `dhl | aramex | ups | nepal_post | emirates_post | thailand_post | japan_post | malaysia_post | dtdc | delhivery | indian_post | nepal_can_move | sajha_courier | upaya_courier | stripe | connectips | fonepay | noonpay | razorpay`
- `credentials: jsonb` (encrypted at rest — API keys, secrets, merchant IDs)
- `active: boolean`
- `last_tested_at: timestamp` (nullable)
- `test_status: enum` — `untested | success | failed`
- `created_at`, `updated_at`

#### Agents

**`Agent`**
- `id`, `tenant_id` (FK → Tenant), `user_id` (FK → User)
- `account_type: enum` — `credit | regular`
- `credit_limit: decimal` (nullable — only for credit type)
- `wallet_balance: decimal` (default 0 — only for regular type)
- `scope_regions: string[]` (ISO country/city codes this agent can operate in)
- `scope_service_types: enum[]` — `international | domestic | local`
- `active: boolean`
- `created_at`, `updated_at`

#### Bookings

**`Booking`**
- `id`, `tenant_id` (FK → Tenant)
- `airwaybill_number: string` (unique, auto-generated)
- `source: enum` — `manual | bulk_import | quote_request`
- `created_by_user_id` (FK → User, nullable)
- `created_by_agent_id` (FK → Agent, nullable)
- `rate_card_id` (FK → RateCard, nullable)
- `integration_id` (FK → TenantIntegration, nullable) — carrier used
- `sender_name`, `sender_email`, `sender_phone: string`
- `sender_address_line1`, `sender_address_line2`, `sender_city`, `sender_state`, `sender_zip`, `sender_country: string`
- `receiver_name`, `receiver_email`, `receiver_phone: string`
- `receiver_address_line1`, `receiver_address_line2`, `receiver_city`, `receiver_state`, `receiver_zip`, `receiver_country: string`
- `return_address_same_as_sender: boolean`
- `return_address_line1`, `return_address_city`, `return_address_country: string` (nullable)
- `protection_type: enum` — `free | opt_out | insured`
- `protection_value: decimal` (nullable)
- `status: enum` — `draft | confirmed | in_transit | out_for_delivery | delivered | returned | cancelled`
- `total_weight_kg: decimal`
- `shipping_cost: decimal`, `protection_cost: decimal`, `tax: decimal`, `total: decimal`
- `currency: string`
- `notes: string` (nullable)
- `created_at`, `updated_at`

**`BookingParcel`**
- `id`, `booking_id` (FK → Booking)
- `length_cm`, `width_cm`, `height_cm`, `weight_kg: decimal`
- `contents: string`
- `item_value: decimal`
- `currency: string`
- `additional_handling: boolean`
- `handling_label: boolean`

**`BookingDocument`**
- `id`, `booking_id` (FK → Booking)
- `document_type: enum` — `airwaybill | commercial_invoice | customs_invoice`
- `file_path: string` (S3 key or local path via storage abstraction)
- `generated_at: timestamp`

**`BookingStatusHistory`**
- `id`, `booking_id` (FK → Booking)
- `status: enum` (same as Booking.status)
- `notes: string` (nullable)
- `created_by_user_id` (FK → User, nullable)
- `created_at: timestamp`

**`QuoteRequest`**
- `id`, `tenant_id` (FK → Tenant, nullable — from public site, may not know tenant yet)
- `origin_country`, `destination_country: string`
- `weight_kg: decimal`
- `unit: enum` — `kg | lb`
- `requester_email: string` (nullable)
- `status: enum` — `pending | accepted | rejected | expired`
- `booking_id` (FK → Booking, nullable — set when accepted)
- `created_at`, `updated_at`

---

## 5. Super Admin Panel (`admin/`)

**Tech:** Next.js 16 (App Router), Tailwind CSS v4, independent component set.  
**Auth:** Separate login using `SuperAdmin` entity. JWT has no `tenant_id` — admin sees all tenants.

### Pages

```
/login
/dashboard
/tenants
/tenants/new
/tenants/[id]
/plans
/plans/new
/plans/[id]
/payments
/settings
```

### Page Details

**`/dashboard`**
- Cards: Total Tenants, Active Tenants, Total Bookings (all tenants), MRR
- Chart: Plan distribution (pie/bar)
- Table: Recently onboarded tenants

**`/tenants`**
- Paginated list: company name, slug, plan, status (active/suspended), booking count, joined date
- Search by name/email; filter by plan + status

**`/tenants/new`**
- Form fields: company name, email, phone, address, logo upload, assign plan
- On submit: creates Tenant (slug auto-generated from company name) + sends invite email
- Partner receives email → clicks link → sets password → email verified → `Tenant.active = true`

**`/tenants/[id]`**
- Company info + current plan
- Booking volume summary (read-only)
- Actions:
  - **Change plan** — dropdown → confirm → updates `TenantPlan`
  - **Suspend** — sets `Tenant.active = false`, blocks all dashboard logins for that tenant
  - **Reactivate** — sets `Tenant.active = true`
  - **Impersonate** — backend issues a short-lived (15min) scoped token → admin is redirected to `dashboard.nepexcargo.com` (always the platform domain, never the tenant's custom domain) as that tenant owner. A persistent banner shows "Impersonating [Company Name] — Exit" and clicking Exit destroys the scoped token.

**`/plans`**
- List: name, price, billing cycle, feature count, tenant count using it

**`/plans/new` / `/plans/[id]`**
- Fields: name, price, billing_cycle (monthly/yearly), feature flags (max_agents, max_bookings_per_month, integrations_allowed, etc.)

**`/payments`**
- Payment history across all tenants: tenant, amount, currency, gateway, status, date
- Filter by tenant, date range, status

**`/settings`**
- Platform config: SMTP settings, supported countries list, platform name/logo

---

## 6. Partner Dashboard (`dashboard/`)

**Tech:** Next.js 16 (App Router), Tailwind CSS v4, independent component set.  
**Auth:** Login at `/login`. JWT carries `tenant_id` + `role` (`partner_owner | agent`).  
**Tenant resolution:** Middleware reads `Host` header → looks up `tenant_domain` → resolves `tenant_id` → all API calls scoped to that tenant.

### Profile Gate

If `Tenant.profile_complete = false` → redirect to `/setup` regardless of intended destination.

**`/setup`** — Company profile wizard:
1. Basic info: company name, logo upload, phone, website
2. Address: street, city, state/province, zip, country
3. Operations: service regions (multi-select countries), supported shipment types (international / domestic / local)
4. Save → sets `Tenant.profile_complete = true` → redirects to `/dashboard`

### Pages

```
/login
/setup

/dashboard
/rates/zones
/rates/rate-cards
/rates/rate-cards/new
/rates/rate-cards/[id]

/integrations

/agents
/agents/new
/agents/[id]

/bookings
/bookings/new
/bookings/import
/bookings/quotes
/bookings/[id]

/tracking/[awb]

/settings/profile
/settings/domain
/settings/notifications
/settings/billing
```

### Page Details

**`/dashboard`**
- Cards: Active Bookings, In Transit, Delivered (this month), Agents, Revenue (this month)
- Table: Recent bookings with status
- Chart: Booking volume over time

**`/rates/zones`**
- List of zones: name, country/city count, rate card count
- Create/edit zone: name + multi-select countries + optional cities

**`/rates/rate-cards`**
- List: name, type (zone/route/flat), linked carrier, weight tiers count, active status
- Filter by type, carrier, active

**`/rates/rate-cards/new` + `/[id]`** — Rate card builder:
1. Pick type: Zone-based | Route-based | Flat
2. Set origin + destination (zone selector OR country/city fields)
3. Optionally link to a delivery integration (TenantIntegration)
4. Add weight tiers (min_kg → max_kg → price_per_kg + optional flat_price)
5. Set currency → save

**`/integrations`**
- Grid of all available integrations, grouped by category

  *Delivery Partners:* DHL, Aramex, UPS, Nepal Post, Emirates Post, Nepal Can Move, Sajha Courier, Upaya Courier, DTDC, Delhivery, Indian Post, Thailand Post, Japan Post, Malaysian Post, Nepex Cargo (internal)

  *Payment Gateways:* Stripe, ConnectIPS, Fonepay, NoonPay, Razorpay

- Each card shows: logo, name, toggle (ON/OFF)
- Toggle ON → "Settings" button appears
- Click Settings → slide-in panel with credential fields specific to that integration (API key, secret, merchant ID, etc.)
- Save → system tests the connection → shows `test_status` (success/failed)
- Toggle OFF → deactivates integration (credentials preserved)

**`/agents`**
- List: name, email, account type, wallet balance / credit limit + used, scope regions, active status
- Inline actions: top-up wallet (regular), adjust credit limit (credit), activate/deactivate

**`/agents/new` + `/[id]`**
- Fields: first name, last name, email, phone
- Scope: regions (country/city multi-select), service types (international/domestic/local)
- Account type: Regular (set initial wallet balance) or Credit (set credit limit)
- On create: user account created → invite email sent → agent sets password

**`/bookings`**
- List with filters: status, date range, carrier, agent, origin, destination
- Columns: AWB, sender, receiver, carrier, weight, status, created by, date, total

**`/bookings/new`** — Manual booking wizard (mirrors Figma design):
1. **Shipment Details** — add parcels (dimensions, weight, contents, value), sending from/to countries, handling flags
2. **Sender Details** — name, org (optional), email, phone, return address (search or manual)
3. **Receiver Details** — name, org (optional), email, phone, delivery address (search or manual)
4. **Select Rate/Carrier** — show matching rate cards + carrier options for the route/weight; user selects
5. **Protection Cover** — free / opt-out / Shipsurance
6. **Confirm** — summary of all details + price breakdown → "Confirm and add to cart" / confirm booking
7. On confirm: generate `airwaybill_number`, create `BookingDocument` records (airwaybill + invoice)

**`/bookings/import`**
- Upload CSV or Excel
- Field mapping UI (map CSV columns to booking fields)
- Validation preview (highlight errors before import)
- Submit → bulk create bookings

**`/bookings/quotes`**
- List of inbound `QuoteRequest` records: origin, destination, weight, requester email, date
- Actions: Accept (converts to booking in `/bookings/new` with fields pre-filled) | Reject

**`/bookings/[id]`**
- Full booking detail: sender, receiver, parcels, carrier, protection, price breakdown
- Documents section: download airwaybill, commercial invoice, customs invoice
- Status history timeline
- Actions: Update status, Forward to vendor integration, Cancel

**`/tracking/[awb]`**
- Status timeline for a shipment
- Shareable public URL (no auth required to view)

**`/settings/profile`** — Edit company profile fields

**`/settings/domain`**
- Current domain(s) in `tenant_domain` table
- Add custom domain → enter domain → system generates a DNS TXT/CNAME record to verify → verify → active

**`/settings/notifications`** — Toggle email/SMS notifications (booking confirmed, status updates, payment received)

**`/settings/billing`** — Current plan, usage vs limits, upgrade CTA, invoice history

### Agent Role Restrictions

When `role = agent`, the following are hidden/inaccessible:
- `/rates/*`
- `/integrations`
- `/agents/*` (agents cannot manage other agents)
- `/settings/billing`, `/settings/domain`
- `/bookings` is scoped: only bookings created within `Agent.scope_regions` + `Agent.scope_service_types`
- Wallet/credit balance visible in the top navigation bar

---

## 7. Backend API Additions

New route groups to add under `/api/v1/`:

| Route Group | Notes |
|-------------|-------|
| `POST /auth/partner/login` | Tenant-scoped login, returns JWT with tenant_id + role |
| `POST /auth/partner/invite/accept` | Partner sets password after invite |
| `GET/PUT /tenants/me/profile` | Partner updates own company profile |
| `GET/POST /zones` | Rate zone CRUD (tenant-scoped) |
| `GET/POST/PUT/DELETE /rate-cards` | Rate card + weight tier CRUD |
| `GET/POST/PUT/DELETE /integrations` | TenantIntegration CRUD + test-connection endpoint |
| `GET/POST/PUT /agents` | Agent management |
| `POST /agents/:id/wallet/topup` | Add to agent wallet balance |
| `GET/POST/PUT /bookings` | Booking CRUD |
| `POST /bookings/import` | Bulk CSV/Excel import |
| `GET /bookings/quotes` | Quote request list + accept/reject |
| `POST /bookings/:id/documents` | Generate/regenerate documents |
| `POST /bookings/:id/status` | Update booking status (appends to history) |
| `GET /tracking/:awb` | Public tracking endpoint (no auth) |
| `GET /super-admin/tenants` | All tenants (super admin only) |
| `POST /super-admin/tenants` | Create + invite tenant |
| `POST /super-admin/tenants/:id/impersonate` | Issue scoped token |
| `PUT /super-admin/tenants/:id/status` | Suspend / reactivate |
| `GET/POST/PUT /super-admin/plans` | Plan management |
| `GET /super-admin/payments` | Cross-tenant payment history |

---

## 8. Implementation Order

Build in this sequence so each layer unblocks the next:

1. **Backend — new entities + migrations** (Tenant.slug, Zone, RateCard, WeightTier, TenantIntegration, Agent, Booking, BookingParcel, BookingDocument, BookingStatusHistory, QuoteRequest)
2. **Backend — new API routes** (auth, profile, rates, integrations, agents, bookings, tracking, super-admin routes)
3. **`admin/` app** — scaffold Next.js, implement login → tenant list → onboard tenant → plan management → impersonation
4. **`dashboard/` app** — scaffold Next.js, implement login → profile setup gate → dashboard → integrations → rates → agents → bookings (manual) → bookings (import + quotes) → tracking → settings

---

## 9. Out of Scope (this spec)

- Payment processing / checkout flow (separate spec)
- Public-facing quote + booking flow on `frontend/` (separate spec)
- Notification delivery implementation (email/SMS provider wiring)
- Document PDF generation engine (airwaybill, invoice templates)
- CI/CD pipeline for `admin/` and `dashboard/` apps
