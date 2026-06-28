# Backend API Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all REST API routes for tenant auth, partner operations, and public tracking.

**Architecture:** Express routes → controllers → services → TypeORM repositories. Tenant routes mount at /api/v1/tenant, super admin additions mount at /api/v1/admin, public at /api/v1/public.

**Tech Stack:** Express, TypeORM, PostgreSQL, Zod, JWT (jsonwebtoken), bcrypt

## Global Constraints
- Never mock the database in tests — use real DB with `truncateTable` helper from `tests/helpers/db.helper.ts`
- Tenant routes require `checkTenant()` middleware; partner-owner-only routes use `checkPartnerOwner()`
- Profile gate (`requireOnboarding`) applied to all tenant routes except `/tenant/profile` and `/tenant/auth`
- Money columns: `numeric(18,2)`
- Migration timestamps: 15-digit UTC via `node -e` command in `backend/src/database/migrations/RULES.md`
- UUID PKs: `uuid_generate_v4()`
- Test file pattern: `tests/integration/*.test.ts`
- Token shape for tenant users: `{ sub: userId, tenantId, role: 'partner_owner' | 'agent', type: 'tenant_user' }`
- Follow existing pattern exactly: routes (`src/routes/v1/`) → controllers (`src/controllers/`) → services (`src/services/`) → repositories (`src/database/repositories/`)
- Repository singletons exported from `src/database/repositories/index.ts`
- ApiResponse helper: `ApiResponse.success()`, `.created()`, `.paginated()`, `.noContent()`
- Exception classes: `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `BadRequestException` from `@common/exceptions/app.exception`

---

## Task 1 — Tenant Auth Middleware + Auth Routes + Migration

**Purpose:** Allow tenant users (partner_owner, agent) to authenticate, accept invitations, and inspect their own profile. Gate all downstream tenant routes.

### Files to Create
- `backend/src/common/middlewares/tenant-auth.middleware.ts`
- `backend/src/routes/v1/tenant-auth.routes.ts`
- `backend/src/controllers/tenant-auth.controller.ts`
- `backend/src/services/tenant-auth.service.ts`
- `backend/src/common/dto/tenant-auth.dto.ts`
- `backend/src/database/migrations/<TIMESTAMP>-add-tenant-role-to-users.ts`

### Files to Modify
- `backend/src/routes/v1/index.ts` — mount `/tenant/auth` and `/tenant` router
- `backend/src/database/entities/user.entity.ts` — add `tenantId`, `phone`, `tenantRole` columns
- `backend/src/database/entities/index.ts` — export `TenantRole` enum if added to entities

### Key Signatures

```ts
// tenant-auth.middleware.ts
export enum TenantRole { PARTNER_OWNER = 'partner_owner', AGENT = 'agent' }

// Attaches req.tenantUser = { id, tenantId, role }
export const checkTenant = () => RequestHandler
// Same as checkTenant() but additionally asserts role === 'partner_owner'
export const checkPartnerOwner = () => RequestHandler
// Asserts req.tenantUser's tenant has onboardingCompleted === true
export const requireOnboarding = () => RequestHandler

// Extend Express.Request
declare global {
  namespace Express {
    interface Request {
      tenantUser?: { id: string; tenantId: string; role: TenantRole };
    }
  }
}

// tenant-auth.service.ts
class TenantAuthService {
  login(email: string, password: string): Promise<{ user: SafeUser; token: string }>
  acceptInvite(token: string, password: string): Promise<{ user: SafeUser; token: string }>
  me(userId: string): Promise<SafeUser>
}

// tenant-auth.dto.ts (Zod)
export const tenantLoginSchema    // { email, password }
export const acceptInviteSchema   // { inviteToken, password, firstName?, lastName? }
```

### Route Endpoints
```
POST /api/v1/tenant/auth/login          — no auth
POST /api/v1/tenant/auth/invite/accept  — no auth
GET  /api/v1/tenant/auth/me             — checkTenant()
```

### Migration
Add columns to `users` table: `tenantId uuid nullable`, `phone varchar(50) nullable`, `tenantRole varchar(30) nullable`.
Migration name pattern: `<TIMESTAMP>-add-tenant-role-to-users.ts` / class `AddTenantRoleToUsers<TIMESTAMP>`.

### Integration Test Example
```ts
// tests/integration/tenant-auth.test.ts
describe('POST /api/v1/tenant/auth/login', () => {
  it('returns 200 + token for valid credentials', async () => {
    const user = await seedTenantUser({ role: 'partner_owner' });
    const res = await api.post('/api/v1/tenant/auth/login')
      .send({ email: user.email, password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});
```

### Commit
```bash
git add backend/src/common/middlewares/tenant-auth.middleware.ts \
        backend/src/routes/v1/tenant-auth.routes.ts \
        backend/src/controllers/tenant-auth.controller.ts \
        backend/src/services/tenant-auth.service.ts \
        backend/src/common/dto/tenant-auth.dto.ts \
        "backend/src/database/migrations/<TIMESTAMP>-add-tenant-role-to-users.ts" \
        backend/src/database/entities/user.entity.ts \
        backend/src/routes/v1/index.ts
git commit -m "feat: add tenant auth middleware and auth routes"
```

---

## Task 2 — New Repositories

**Purpose:** Provide typed TypeORM repository wrappers for the Plan 1 entities (Zone, RateCard, Agent, Booking, QuoteRequest). All new routes will depend on these.

### Files to Create
- `backend/src/database/repositories/zone.repository.ts`
- `backend/src/database/repositories/rate-card.repository.ts`
- `backend/src/database/repositories/agent.repository.ts`
- `backend/src/database/repositories/booking.repository.ts`
- `backend/src/database/repositories/quote-request.repository.ts`

### Files to Modify
- `backend/src/database/repositories/index.ts` — add five new exports
- `backend/src/database/entities/index.ts` — ensure Zone, RateCard, WeightTier, Agent, Booking, BookingParcel, BookingStatusHistory, QuoteRequest are exported

### Key Signatures
Each repository follows the existing singleton pattern:

```ts
// zone.repository.ts
export const zoneRepository = AppDataSource.getRepository(Zone).extend({
  findByTenant(tenantId: string): Promise<Zone[]>
  findByTenantAndId(tenantId: string, id: string): Promise<Zone | null>
});

// rate-card.repository.ts
export const rateCardRepository = AppDataSource.getRepository(RateCard).extend({
  findByTenant(tenantId: string): Promise<RateCard[]>
  findWithTiers(id: string): Promise<RateCard | null>  // relations: ['weightTiers']
});

// agent.repository.ts
export const agentRepository = AppDataSource.getRepository(Agent).extend({
  findByTenant(tenantId: string): Promise<Agent[]>
  findByTenantAndId(tenantId: string, id: string): Promise<Agent | null>
});

// booking.repository.ts
export const bookingRepository = AppDataSource.getRepository(Booking).extend({
  findByTenant(tenantId: string, opts: { page: number; limit: number }): Promise<[Booking[], number]>
  findByTenantAndId(tenantId: string, id: string): Promise<Booking | null>
  findByAwb(awb: string): Promise<Booking | null>
});

// quote-request.repository.ts
export const quoteRequestRepository = AppDataSource.getRepository(QuoteRequest).extend({
  findByTenant(tenantId: string, opts: { page: number; limit: number }): Promise<[QuoteRequest[], number]>
  findByTenantAndId(tenantId: string, id: string): Promise<QuoteRequest | null>
});
```

### Integration Test Example
```ts
// tests/integration/repositories.test.ts
it('zoneRepository.findByTenant returns only zones for the given tenant', async () => {
  await seedZone({ tenantId: 'tenant-a' });
  await seedZone({ tenantId: 'tenant-b' });
  const zones = await zoneRepository.findByTenant('tenant-a');
  expect(zones).toHaveLength(1);
  expect(zones[0].tenantId).toBe('tenant-a');
});
```

### Commit
```bash
git add backend/src/database/repositories/ backend/src/database/entities/index.ts
git commit -m "feat: add zone, rate-card, agent, booking, quote-request repositories"
```

---

## Task 3 — Super Admin Tenant Management Routes

**Purpose:** Allow super admins to list, inspect, update plan, suspend, activate, and impersonate tenants.

### Files to Create
- `backend/src/controllers/super-admin-tenant.controller.ts`
- `backend/src/services/super-admin-tenant.service.ts`
- `backend/src/common/dto/super-admin-tenant.dto.ts`

### Files to Modify
- `backend/src/routes/v1/super-admin.routes.ts` — add tenant management routes

### Route Endpoints
```
GET    /api/v1/admin/tenants                    — checkSuperAdmin(), paginated list
POST   /api/v1/admin/tenants                    — checkSuperAdmin(), create tenant
GET    /api/v1/admin/tenants/:id                — checkSuperAdmin(), single tenant + plan/usage
PATCH  /api/v1/admin/tenants/:id/plan           — checkSuperAdmin(), change active plan
POST   /api/v1/admin/tenants/:id/suspend        — checkSuperAdmin()
POST   /api/v1/admin/tenants/:id/activate       — checkSuperAdmin()
POST   /api/v1/admin/tenants/:id/impersonate    — checkSuperAdmin(), returns short-lived tenant JWT
```

### Key Signatures

```ts
// super-admin-tenant.dto.ts
export const createTenantSchema    // { legalName, slug, email, planId, currency? }
export const updateTenantPlanSchema  // { planId, billingCycle }

// super-admin-tenant.service.ts
class SuperAdminTenantService {
  list(page: number, limit: number, search?: string): Promise<[Tenant[], number]>
  create(data: CreateTenantDTO): Promise<Tenant>
  getById(id: string): Promise<Tenant>  // with plans + usage relations
  changePlan(tenantId: string, planId: string, billingCycle: string): Promise<TenantPlan>
  suspend(tenantId: string): Promise<void>
  activate(tenantId: string): Promise<void>
  impersonate(tenantId: string): Promise<{ token: string }>  // type:'tenant_user', role:'partner_owner', expiresIn:'1h'
}
```

### Integration Test Example
```ts
// tests/integration/admin-tenants.test.ts
describe('POST /api/v1/admin/tenants/:id/suspend', () => {
  it('sets tenant status to suspended', async () => {
    const { adminToken, tenant } = await seedAdminAndTenant();
    const res = await api.post(`/api/v1/admin/tenants/${tenant.id}/suspend`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
    const updated = await tenantRepository.findOne({ where: { id: tenant.id } });
    expect(updated!.status).toBe('suspended');
  });
});
```

### Commit
```bash
git add backend/src/controllers/super-admin-tenant.controller.ts \
        backend/src/services/super-admin-tenant.service.ts \
        backend/src/common/dto/super-admin-tenant.dto.ts \
        backend/src/routes/v1/super-admin.routes.ts
git commit -m "feat: add super admin tenant management routes"
```

---

## Task 4 — Super Admin Plan Management + Dashboard Stats

**Purpose:** Allow super admins to manage subscription plans (CRUD) and view a platform-wide dashboard.

### Files to Create
- `backend/src/controllers/super-admin-plan.controller.ts`
- `backend/src/services/super-admin-plan.service.ts`
- `backend/src/common/dto/super-admin-plan.dto.ts`

### Files to Modify
- `backend/src/routes/v1/super-admin.routes.ts` — add plan and dashboard routes

### Route Endpoints
```
GET    /api/v1/admin/plans         — checkSuperAdmin(), list all plans with features
POST   /api/v1/admin/plans         — checkSuperAdmin(), create plan
GET    /api/v1/admin/plans/:id     — checkSuperAdmin()
PATCH  /api/v1/admin/plans/:id     — checkSuperAdmin()
DELETE /api/v1/admin/plans/:id     — checkSuperAdmin(), soft-disable (isActive=false)
GET    /api/v1/admin/dashboard     — checkSuperAdmin()
```

### Key Signatures

```ts
// super-admin-plan.dto.ts
export const createPlanSchema  // { code, name, description?, billingOptions, isPublic?, sortOrder? }
export const updatePlanSchema  // Partial of createPlanSchema

// super-admin-plan.service.ts
class SuperAdminPlanService {
  list(): Promise<Plan[]>  // with features relation
  create(data: CreatePlanDTO): Promise<Plan>
  getById(id: string): Promise<Plan>
  update(id: string, data: UpdatePlanDTO): Promise<Plan>
  deactivate(id: string): Promise<void>  // sets isActive=false
}

// Dashboard stats shape returned by GET /admin/dashboard
interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalRevenue: number;   // sum of tenant wallet top-ups or plan billing
  plansBreakdown: { planName: string; count: number }[];
  recentTenants: Tenant[];  // last 5 created
}
```

### Integration Test Example
```ts
// tests/integration/admin-plans.test.ts
describe('POST /api/v1/admin/plans', () => {
  it('creates a plan and returns 201', async () => {
    const token = await seedAdminToken();
    const res = await api.post('/api/v1/admin/plans').set(authHeader(token)).send({
      code: 'starter', name: 'Starter', billingOptions: [{ billingCycle: 'monthly', price: 29.99, currency: 'USD' }]
    });
    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('starter');
  });
});
```

### Commit
```bash
git add backend/src/controllers/super-admin-plan.controller.ts \
        backend/src/services/super-admin-plan.service.ts \
        backend/src/common/dto/super-admin-plan.dto.ts \
        backend/src/routes/v1/super-admin.routes.ts
git commit -m "feat: add super admin plan management and dashboard routes"
```

---

## Task 5 — Partner Profile Routes

**Purpose:** Let the logged-in partner owner read and update their tenant's profile. Completing all required fields sets `onboardingCompleted = true`.

### Files to Create
- `backend/src/controllers/partner-profile.controller.ts`
- `backend/src/services/partner-profile.service.ts`
- `backend/src/common/dto/partner-profile.dto.ts`
- `backend/src/routes/v1/tenant.routes.ts` _(new file — root tenant router)_

### Files to Modify
- `backend/src/routes/v1/index.ts` — mount tenant router at `/tenant`

### Route Endpoints
These do NOT require `requireOnboarding()` — they are accessible immediately post-login.
```
GET /api/v1/tenant/profile   — checkTenant()
PUT /api/v1/tenant/profile   — checkPartnerOwner()
```

### Key Signatures

```ts
// partner-profile.dto.ts
export const updateProfileSchema  // { displayName?, email?, phone?, currency?, address?: { line1, city, country } }

// partner-profile.service.ts
class PartnerProfileService {
  getProfile(tenantId: string): Promise<Tenant>
  updateProfile(tenantId: string, data: UpdateProfileDTO): Promise<Tenant>
  // After save: if all required fields (legalName, email, phone, currency) present → set onboardingCompleted=true
  private checkOnboardingCompletion(tenant: Tenant): boolean
}
```

### Integration Test Example
```ts
// tests/integration/partner-profile.test.ts
describe('PUT /api/v1/tenant/profile', () => {
  it('sets onboardingCompleted=true when all required fields provided', async () => {
    const { token, tenantId } = await seedPartnerOwner();
    const res = await api.put('/api/v1/tenant/profile').set(authHeader(token))
      .send({ displayName: 'My Cargo', email: 'ops@my.com', phone: '+1234567890', currency: 'USD' });
    expect(res.status).toBe(200);
    expect(res.body.data.onboardingCompleted).toBe(true);
  });
});
```

### Commit
```bash
git add backend/src/controllers/partner-profile.controller.ts \
        backend/src/services/partner-profile.service.ts \
        backend/src/common/dto/partner-profile.dto.ts \
        backend/src/routes/v1/tenant.routes.ts \
        backend/src/routes/v1/index.ts
git commit -m "feat: add partner profile routes with onboarding completion"
```

---

## Task 6 — Rate Management Routes

**Purpose:** Partner owners manage shipping zones and rate cards (with nested weight tiers) scoped to their tenant.

### Files to Create
- `backend/src/controllers/rate-management.controller.ts`
- `backend/src/services/rate-management.service.ts`
- `backend/src/common/dto/rate-management.dto.ts`

### Files to Modify
- `backend/src/routes/v1/tenant.routes.ts` — mount zone and rate-card sub-routes

### Route Endpoints
All require `checkPartnerOwner()` + `requireOnboarding()`.
```
GET    /api/v1/tenant/zones
POST   /api/v1/tenant/zones
GET    /api/v1/tenant/zones/:id
PUT    /api/v1/tenant/zones/:id
DELETE /api/v1/tenant/zones/:id

GET    /api/v1/tenant/rate-cards
POST   /api/v1/tenant/rate-cards              — body includes weightTiers[]
GET    /api/v1/tenant/rate-cards/:id          — includes weightTiers
PUT    /api/v1/tenant/rate-cards/:id          — replaces weightTiers
DELETE /api/v1/tenant/rate-cards/:id
```

### Key Signatures

```ts
// rate-management.dto.ts
export const createZoneSchema   // { name, description?, countries: string[] }
export const updateZoneSchema   // Partial<createZoneSchema>

export const weightTierSchema   // { minWeight, maxWeight, price }
export const createRateCardSchema  // { name, zoneId, currency, weightTiers: weightTierSchema[] }
export const updateRateCardSchema  // Partial; weightTiers replace-all semantics

// rate-management.service.ts
class RateManagementService {
  listZones(tenantId: string): Promise<Zone[]>
  createZone(tenantId: string, data: CreateZoneDTO): Promise<Zone>
  updateZone(tenantId: string, id: string, data: UpdateZoneDTO): Promise<Zone>
  deleteZone(tenantId: string, id: string): Promise<void>

  listRateCards(tenantId: string): Promise<RateCard[]>
  createRateCard(tenantId: string, data: CreateRateCardDTO): Promise<RateCard>  // saves WeightTier rows in same tx
  getRateCard(tenantId: string, id: string): Promise<RateCard>
  updateRateCard(tenantId: string, id: string, data: UpdateRateCardDTO): Promise<RateCard>  // delete+re-insert tiers
  deleteRateCard(tenantId: string, id: string): Promise<void>
}
```

### Integration Test Example
```ts
// tests/integration/rate-management.test.ts
describe('POST /api/v1/tenant/rate-cards', () => {
  it('creates rate card with weight tiers', async () => {
    const { token, tenantId } = await seedOnboardedPartner();
    const zone = await seedZone({ tenantId });
    const res = await api.post('/api/v1/tenant/rate-cards').set(authHeader(token)).send({
      name: 'Standard', zoneId: zone.id, currency: 'USD',
      weightTiers: [{ minWeight: 0, maxWeight: 5, price: 12.50 }]
    });
    expect(res.status).toBe(201);
    expect(res.body.data.weightTiers).toHaveLength(1);
  });
});
```

### Commit
```bash
git add backend/src/controllers/rate-management.controller.ts \
        backend/src/services/rate-management.service.ts \
        backend/src/common/dto/rate-management.dto.ts \
        backend/src/routes/v1/tenant.routes.ts
git commit -m "feat: add zone and rate card management routes"
```

---

## Task 7 — Integration Management Routes

**Purpose:** Partner owners view, toggle, update credentials, and test courier/payment integrations. Backed by `TenantConfiguration` entity.

### Files to Create
- `backend/src/controllers/integration-management.controller.ts`
- `backend/src/services/integration-management.service.ts`
- `backend/src/common/dto/integration-management.dto.ts`

### Files to Modify
- `backend/src/routes/v1/tenant.routes.ts` — mount integration routes
- `backend/src/database/entities/tenant-configuration.entity.ts` — add `testStatus varchar(20)` and `lastTestedAt timestamptz` columns (Plan 1 extension)
- `backend/src/database/migrations/<TIMESTAMP>-add-integration-test-fields.ts` — migration for those two columns

### Route Endpoints
All require `checkPartnerOwner()` + `requireOnboarding()`.
```
GET   /api/v1/tenant/integrations                          — list all TenantConfiguration rows for tenant
PATCH /api/v1/tenant/integrations/:type/toggle             — flip enabled flag
PUT   /api/v1/tenant/integrations/:type/credentials        — upsert credentials (encrypted at rest)
POST  /api/v1/tenant/integrations/:type/test               — call provider ping, update testStatus + lastTestedAt
```
`:type` maps to `TenantConfigProvider` enum values (e.g. `DHL`, `FedEx`, `Aramex`).

### Key Signatures

```ts
// integration-management.dto.ts
export const updateCredentialsSchema  // { provider: TenantConfigProvider, credentials: Record<string, string>, sandbox?: boolean }

// integration-management.service.ts
class IntegrationManagementService {
  list(tenantId: string): Promise<TenantConfiguration[]>  // strips credentials from response
  toggle(tenantId: string, type: string): Promise<TenantConfiguration>
  updateCredentials(tenantId: string, type: string, data: UpdateCredentialsDTO): Promise<TenantConfiguration>
  test(tenantId: string, type: string): Promise<{ success: boolean; message: string }>
  // delegates to existing integration clients: DhlService, FedexService, etc.
  private getClient(provider: TenantConfigProvider): IntegrationClient
}
```

### Integration Test Example
```ts
// tests/integration/integration-management.test.ts
describe('PATCH /api/v1/tenant/integrations/:type/toggle', () => {
  it('flips enabled from true to false', async () => {
    const { token, tenantId } = await seedOnboardedPartner();
    await seedTenantConfig({ tenantId, provider: 'DHL', enabled: true });
    const res = await api.patch('/api/v1/tenant/integrations/DHL/toggle').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.enabled).toBe(false);
  });
});
```

### Commit
```bash
git add backend/src/controllers/integration-management.controller.ts \
        backend/src/services/integration-management.service.ts \
        backend/src/common/dto/integration-management.dto.ts \
        backend/src/database/entities/tenant-configuration.entity.ts \
        "backend/src/database/migrations/<TIMESTAMP>-add-integration-test-fields.ts" \
        backend/src/routes/v1/tenant.routes.ts
git commit -m "feat: add integration management routes with test/toggle/credential update"
```

---

## Task 8 — Agent Management Routes

**Purpose:** Partner owners manage their delivery agents, top-up agent wallets, and adjust credit limits.

### Files to Create
- `backend/src/controllers/agent-management.controller.ts`
- `backend/src/services/agent-management.service.ts`
- `backend/src/common/dto/agent-management.dto.ts`

### Files to Modify
- `backend/src/routes/v1/tenant.routes.ts` — mount agent routes

### Route Endpoints
All require `requireOnboarding()`. List/read available to `checkTenant()`; create/update/delete/wallet require `checkPartnerOwner()`.
```
GET    /api/v1/tenant/agents            — checkTenant()
POST   /api/v1/tenant/agents            — checkPartnerOwner()
GET    /api/v1/tenant/agents/:id        — checkTenant()
PATCH  /api/v1/tenant/agents/:id        — checkPartnerOwner()
DELETE /api/v1/tenant/agents/:id        — checkPartnerOwner()
POST   /api/v1/tenant/agents/:id/wallet/topup   — checkPartnerOwner()
PATCH  /api/v1/tenant/agents/:id/credit-limit   — checkPartnerOwner()
```

### Key Signatures

```ts
// agent-management.dto.ts
export const createAgentSchema  // { name, email, phone?, employeeId? }
export const updateAgentSchema  // Partial<createAgentSchema> + { status?: 'active'|'inactive' }
export const walletTopupSchema  // { amount: number (positive, numeric) }
export const creditLimitSchema  // { creditLimit: number }

// agent-management.service.ts
class AgentManagementService {
  list(tenantId: string): Promise<Agent[]>
  create(tenantId: string, data: CreateAgentDTO): Promise<Agent>
  getById(tenantId: string, id: string): Promise<Agent>
  update(tenantId: string, id: string, data: UpdateAgentDTO): Promise<Agent>
  delete(tenantId: string, id: string): Promise<void>  // soft delete or status=inactive
  topupWallet(tenantId: string, agentId: string, amount: number): Promise<Agent>
  setCreditLimit(tenantId: string, agentId: string, creditLimit: number): Promise<Agent>
}
```

### Integration Test Example
```ts
// tests/integration/agent-management.test.ts
describe('POST /api/v1/tenant/agents/:id/wallet/topup', () => {
  it('increases agent wallet balance', async () => {
    const { token, tenantId } = await seedOnboardedPartner();
    const agent = await seedAgent({ tenantId, walletBalance: 100 });
    const res = await api.post(`/api/v1/tenant/agents/${agent.id}/wallet/topup`)
      .set(authHeader(token)).send({ amount: 50 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.walletBalance)).toBe(150);
  });
});
```

### Commit
```bash
git add backend/src/controllers/agent-management.controller.ts \
        backend/src/services/agent-management.service.ts \
        backend/src/common/dto/agent-management.dto.ts \
        backend/src/routes/v1/tenant.routes.ts
git commit -m "feat: add agent management routes with wallet topup and credit limit"
```

---

## Task 9 — Booking Management Routes

**Purpose:** Tenant users create and track shipment bookings; partner owners can update status and bulk-import via CSV.

### Files to Create
- `backend/src/controllers/booking-management.controller.ts`
- `backend/src/services/booking-management.service.ts`
- `backend/src/common/dto/booking-management.dto.ts`

### Files to Modify
- `backend/src/routes/v1/tenant.routes.ts` — mount booking routes

### Route Endpoints
```
GET    /api/v1/tenant/bookings          — checkTenant() + requireOnboarding(), paginated
POST   /api/v1/tenant/bookings          — checkTenant() + requireOnboarding()
GET    /api/v1/tenant/bookings/:id      — checkTenant() + requireOnboarding(), includes parcels + status history
PATCH  /api/v1/tenant/bookings/:id/status  — checkPartnerOwner() + requireOnboarding()
POST   /api/v1/tenant/bookings/import   — checkPartnerOwner() + requireOnboarding(), multipart CSV upload
```

### Key Signatures

```ts
// booking-management.dto.ts
export const createBookingSchema  // { agentId?, rateCardId, parcels: [{ weight, description?, value? }], recipientName, recipientAddress, ... }
export const updateBookingStatusSchema  // { status: BookingStatus, note?: string }

// booking-management.service.ts
class BookingManagementService {
  list(tenantId: string, page: number, limit: number): Promise<[Booking[], number]>
  create(tenantId: string, userId: string, data: CreateBookingDTO): Promise<Booking>
  // auto-generates AWB, seeds BookingStatusHistory row with status='pending'
  getById(tenantId: string, id: string): Promise<Booking>
  updateStatus(tenantId: string, id: string, status: BookingStatus, note?: string): Promise<Booking>
  // appends BookingStatusHistory row
  importCsv(tenantId: string, userId: string, fileBuffer: Buffer): Promise<{ created: number; errors: string[] }>
}
```

CSV import: parse with a lightweight library (e.g. `csv-parse`), validate each row against `createBookingSchema`, insert successful rows in one transaction, return error list for failed rows.

### Integration Test Example
```ts
// tests/integration/booking-management.test.ts
describe('PATCH /api/v1/tenant/bookings/:id/status', () => {
  it('appends a status history entry', async () => {
    const { token, tenantId } = await seedOnboardedPartner();
    const booking = await seedBooking({ tenantId, status: 'pending' });
    const res = await api.patch(`/api/v1/tenant/bookings/${booking.id}/status`)
      .set(authHeader(token)).send({ status: 'in_transit', note: 'Picked up' });
    expect(res.status).toBe(200);
    expect(res.body.data.statusHistory).toHaveLength(2);
  });
});
```

### Commit
```bash
git add backend/src/controllers/booking-management.controller.ts \
        backend/src/services/booking-management.service.ts \
        backend/src/common/dto/booking-management.dto.ts \
        backend/src/routes/v1/tenant.routes.ts
git commit -m "feat: add booking management routes with CSV import"
```

---

## Task 10 — Quote Requests + Public Tracking Route

**Purpose:** Partner owners review inbound quote requests from agents/customers and accept or reject them. A public endpoint allows anyone to track a shipment by AWB without authentication.

### Files to Create
- `backend/src/controllers/quote-request.controller.ts`
- `backend/src/services/quote-request.service.ts`
- `backend/src/controllers/public-tracking.controller.ts`
- `backend/src/services/public-tracking.service.ts`
- `backend/src/routes/v1/public.routes.ts`

### Files to Modify
- `backend/src/routes/v1/tenant.routes.ts` — mount quote routes
- `backend/src/routes/v1/index.ts` — mount `/public` router

### Route Endpoints
```
# Tenant-scoped (require checkPartnerOwner() + requireOnboarding())
GET  /api/v1/tenant/quotes              — paginated list
POST /api/v1/tenant/quotes/:id/accept   — sets status='accepted', creates Booking
POST /api/v1/tenant/quotes/:id/reject   — sets status='rejected', optional reason

# Public (no auth)
GET  /api/v1/public/tracking/:awb       — returns booking status + history (no credentials)
```

### Key Signatures

```ts
// quote-request.service.ts
class QuoteRequestService {
  list(tenantId: string, page: number, limit: number): Promise<[QuoteRequest[], number]>
  accept(tenantId: string, id: string): Promise<Booking>  // transitions QuoteRequest + creates Booking
  reject(tenantId: string, id: string, reason?: string): Promise<QuoteRequest>
}

// public-tracking.service.ts
class PublicTrackingService {
  trackByAwb(awb: string): Promise<TrackingResult>
}

interface TrackingResult {
  awb: string;
  status: BookingStatus;
  recipientName: string;
  origin: string;
  destination: string;
  estimatedDelivery?: Date;
  history: { status: BookingStatus; note?: string; createdAt: Date }[];
}

// public.routes.ts
export const publicRoutes: Router = Router();
publicRoutes.get('/tracking/:awb', trackByAwb);  // rate-limited; no auth middleware
```

Apply `rateLimiterMiddleware` on the public tracking endpoint to prevent abuse.

### Integration Test Example
```ts
// tests/integration/public-tracking.test.ts
describe('GET /api/v1/public/tracking/:awb', () => {
  it('returns booking status and history without authentication', async () => {
    const booking = await seedBooking({ awb: 'NPX-001', status: 'in_transit' });
    const res = await api.get('/api/v1/public/tracking/NPX-001');
    expect(res.status).toBe(200);
    expect(res.body.data.awb).toBe('NPX-001');
    expect(res.body.data.history).toBeDefined();
  });

  it('returns 404 for unknown AWB', async () => {
    const res = await api.get('/api/v1/public/tracking/UNKNOWN');
    expect(res.status).toBe(404);
  });
});
```

### Commit
```bash
git add backend/src/controllers/quote-request.controller.ts \
        backend/src/services/quote-request.service.ts \
        backend/src/controllers/public-tracking.controller.ts \
        backend/src/services/public-tracking.service.ts \
        backend/src/routes/v1/public.routes.ts \
        backend/src/routes/v1/tenant.routes.ts \
        backend/src/routes/v1/index.ts
git commit -m "feat: add quote request management and public shipment tracking routes"
```

---

## Final Route Index Summary

After all tasks, `backend/src/routes/v1/index.ts` should mount:

```ts
v1Router.use('/admin',  superAdminRoutes);   // Tasks 1, 3, 4
v1Router.use('/tenant', tenantRoutes);        // Tasks 1, 5–10
v1Router.use('/public', publicRoutes);        // Task 10
```

`tenantRoutes` internal structure:
```ts
// /tenant/auth/* — no requireOnboarding
tenantRoutes.use('/auth', tenantAuthRoutes);

// /tenant/profile — no requireOnboarding
tenantRoutes.get('/profile',  checkTenant(), getProfile);
tenantRoutes.put('/profile',  checkPartnerOwner(), updateProfile);

// All routes below use requireOnboarding()
tenantRoutes.use(requireOnboarding());
tenantRoutes.use('/zones',        zoneRoutes);
tenantRoutes.use('/rate-cards',   rateCardRoutes);
tenantRoutes.use('/integrations', integrationRoutes);
tenantRoutes.use('/agents',       agentRoutes);
tenantRoutes.use('/bookings',     bookingRoutes);
tenantRoutes.use('/quotes',       quoteRoutes);
```
