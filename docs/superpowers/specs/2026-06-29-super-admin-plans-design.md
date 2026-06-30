# Super Admin — Plans CRUD Design

**Date:** 2026-06-29
**Scope:** Phase 1 of super-admin platform management — Plans only. Subscriptions are a separate subsequent phase.

---

## Context

The `plans`, `plan_features`, and `tenant_plans` tables and their TypeORM entities/repositories already exist and are migrated. No schema changes are required. This spec covers only the service, controller, DTO, routing, and Swagger documentation layer.

---

## API Surface

All endpoints are mounted under `/admin/plans` and protected by the existing `checkSuperAdmin()` middleware.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/plans` | List all plans with features, ordered by `sortOrder ASC` |
| POST | `/admin/plans` | Create a plan with its features |
| GET | `/admin/plans/:id` | Get a single plan with features |
| PATCH | `/admin/plans/:id` | Update plan fields + replace all features |
| DELETE | `/admin/plans/:id` | Hard delete (blocked if active tenant subscriptions exist) |

---

## Request Body

**Create (`POST /admin/plans`)** — all core fields required, `features` defaults to `[]`:

```json
{
  "code": "starter",
  "name": "Starter Plan",
  "description": "For small teams",
  "billingOptions": [
    { "billingCycle": "monthly", "price": 29.99, "currency": "USD" },
    { "billingCycle": "yearly",  "price": 299.00, "currency": "USD" }
  ],
  "isPublic": true,
  "isActive": true,
  "sortOrder": 1,
  "features": [
    { "featureKey": "max_users",     "featureType": "number",  "featureValue": 10 },
    { "featureKey": "custom_domain", "featureType": "boolean", "featureValue": true }
  ]
}
```

**Update (`PATCH /admin/plans/:id`)** — all fields optional (partial of create schema).

---

## DTO Validation (`src/common/dto/plan.dto.ts`)

Sub-schemas:

- **`billingOptionSchema`**: `billingCycle` ∈ `{monthly, yearly, custom}`, `price` > 0 (finite number), `currency` exactly 3 uppercase characters (ISO 4217).
- **`featureSchema`**: `featureKey` non-empty string ≤ 100 chars, `featureType` ∈ `{boolean, number, string, list}`, `featureValue` any valid JSON.

`createPlanSchema`:

| Field | Type | Rules |
|-------|------|-------|
| `code` | string | 1–50 chars; only `a-z`, `0-9`, `-`, `_` (regex `/^[a-z0-9_-]+$/`) |
| `name` | string | 1–255 chars, trimmed |
| `description` | string | optional, trimmed |
| `billingOptions` | array | min 1 item, each valid `billingOptionSchema` |
| `isPublic` | boolean | default `true` |
| `isActive` | boolean | default `true` |
| `sortOrder` | integer | ≥ 0, default `0` |
| `features` | array | default `[]`, each valid `featureSchema` |

`updatePlanSchema` = `createPlanSchema.partial()` — every field optional; if `features` is provided it replaces all existing features.

---

## Service Logic (`src/services/plan.service.ts`)

Single `PlanService` class using `planRepository`, `planFeatureRepository`, and `AppDataSource` (for transactions).

### `listPlans()`
- `planRepository.find({ relations: ['features'], order: { sortOrder: 'ASC' } })`
- Returns all plans regardless of `isActive`/`isPublic` (admin sees everything).

### `getPlan(id: string)`
- `planRepository.findWithFeatures(id)`
- Throws `NotFoundException('Plan')` if not found.

### `createPlan(data: CreatePlanDTO)`
Runs inside `AppDataSource.transaction()`:
1. Check `planRepository.findByCode(data.code)` → throw `ConflictException('Plan code already in use')` if exists.
2. Create and save the `Plan` entity (without features).
3. Bulk-insert `PlanFeature[]` with the saved plan's `id`.
4. Return plan with features via `getPlan(plan.id)`.

### `updatePlan(id: string, data: UpdatePlanDTO)`
Runs inside `AppDataSource.transaction()`:
1. Load plan (`getPlan`) → throw `NotFoundException` if missing.
2. If `data.code` provided and differs from current code → check uniqueness, throw `ConflictException` if taken.
3. `Object.assign(plan, omit(data, 'features'))` → save plan.
4. If `data.features` is provided: `planFeatureRepository.delete({ planId: id })` → bulk-insert new features.
5. Return updated plan with features.

### `deletePlan(id: string)`
1. Load plan → throw `NotFoundException` if missing.
2. Count `tenant_plans` where `planId = id` AND `status IN ('trial', 'active', 'paused')`.
3. If count > 0 → throw `BadRequestException('Cannot delete plan: ${count} tenant(s) have an active subscription on this plan')`.
4. `planRepository.delete(id)` — cascade removes `plan_features`.

---

## Controller (`src/controllers/plan.controller.ts`)

Five exported async functions following the existing `(req, res, next) => try/catch/next(error)` pattern:

| Export | Route | Service call |
|--------|-------|-------------|
| `listPlans` | `GET /admin/plans` | `planService.listPlans()` → `ApiResponse.success` |
| `getPlan` | `GET /admin/plans/:id` | `planService.getPlan(req.params.id)` → `ApiResponse.success` |
| `createPlan` | `POST /admin/plans` | `planService.createPlan(req.body)` → `ApiResponse.created` |
| `updatePlan` | `PATCH /admin/plans/:id` | `planService.updatePlan(req.params.id, req.body)` → `ApiResponse.success` |
| `deletePlan` | `DELETE /admin/plans/:id` | `planService.deletePlan(req.params.id)` → `ApiResponse.noContent` |

---

## Routing (`src/routes/v1/super-admin.routes.ts`)

Additions only — no existing routes changed:

```ts
import { validate } from '@common/middlewares/validate.middleware';
import { createPlanSchema, updatePlanSchema } from '@common/dto/plan.dto';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan } from '@controllers/plan.controller';

superAdminRoutes.get('/plans',     checkSuperAdmin(), listPlans);
superAdminRoutes.post('/plans',    checkSuperAdmin(), validate(createPlanSchema), createPlan);
superAdminRoutes.get('/plans/:id', checkSuperAdmin(), getPlan);
superAdminRoutes.patch('/plans/:id', checkSuperAdmin(), validate(updatePlanSchema), updatePlan);
superAdminRoutes.delete('/plans/:id', checkSuperAdmin(), deletePlan);
```

---

## Swagger Docs (`src/docs/plan.docs.ts`)

New file imported in `src/docs/index.ts`. Registers:
- `PlanFeatureSchema` — inline object schema
- `BillingOptionSchema` — inline object schema
- `PlanSchema` — full plan response including `features[]`
- `CreatePlanBody` / `UpdatePlanBody` — request body schemas with examples
- All 5 paths under tag `Super Admin — Plans`

---

## Error Responses

| Scenario | Exception | HTTP |
|----------|-----------|------|
| Plan not found | `NotFoundException` | 404 |
| `code` already taken | `ConflictException` | 409 |
| Delete blocked by tenants | `BadRequestException` | 400 |
| Invalid request body | validation middleware | 422 |

---

## Out of Scope

- Subscriptions (tenant assigned to plan) — next phase
- Public-facing plan listing endpoint (not an admin concern)
- Plan versioning / audit log
