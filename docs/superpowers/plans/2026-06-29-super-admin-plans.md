# Super Admin — Plans CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full Plans CRUD (list, create, get, update, delete) to the super-admin API, including per-plan feature management via replace-all strategy.

**Architecture:** Four new files (DTO, service, controller, Swagger docs) plus additions to two existing files (routes, docs index). All plan + plan_features tables already exist in the DB — no migrations needed. Write operations use TypeORM transactions to keep plan + features in sync.

**Tech Stack:** TypeScript, Express, TypeORM, Zod (validation + OpenAPI), Jest (ts-jest)

## Global Constraints

- All new routes sit under `/admin/plans` and are protected by `checkSuperAdmin()` middleware.
- No migrations — `plans` and `plan_features` tables are already migrated.
- Follow existing try/catch/next(error) controller pattern.
- Module aliases: `@database/*`, `@services/*`, `@common/*`, `@controllers/*` (see `jest.config.ts` for full list).
- Test runner: `npx jest <path> --no-coverage` (Jest + ts-jest).
- Commit after every task.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/common/dto/plan.dto.ts` | Zod schemas for create + update |
| Create | `src/services/plan.service.ts` | Business logic (list, get, create, update, delete) |
| Create | `src/controllers/plan.controller.ts` | HTTP layer — thin wrappers over PlanService |
| Create | `src/docs/plan.docs.ts` | Swagger/OpenAPI registration for plan routes |
| Modify | `src/routes/v1/super-admin.routes.ts` | Mount 5 new plan routes |
| Modify | `src/docs/index.ts` | Import plan.docs.ts |
| Modify | `src/services/index.ts` | Export PlanService + planService |
| Create | `tests/unit/dto/plan.dto.test.ts` | Schema validation tests |
| Create | `tests/unit/services/plan.service.test.ts` | Service unit tests |

---

## Task 1: Plan DTOs

**Files:**
- Create: `src/common/dto/plan.dto.ts`
- Create: `tests/unit/dto/plan.dto.test.ts`

**Interfaces:**
- Produces: `CreatePlanDTO`, `UpdatePlanDTO`, `createPlanSchema`, `updatePlanSchema` — consumed by Task 2 (service) and Task 3 (controller + routes)

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/dto/plan.dto.test.ts`:

```ts
// Import after file exists — tests will fail until Step 3
import { createPlanSchema, updatePlanSchema } from '@common/dto/plan.dto';

const validBase = {
  code: 'starter',
  name: 'Starter Plan',
  billingOptions: [{ billingCycle: 'monthly', price: 29.99, currency: 'USD' }],
};

describe('createPlanSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = createPlanSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(true);
      expect(result.data.isActive).toBe(true);
      expect(result.data.sortOrder).toBe(0);
      expect(result.data.features).toEqual([]);
    }
  });

  it('accepts a full payload with features', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      description: 'For small teams',
      isPublic: false,
      isActive: true,
      sortOrder: 2,
      features: [
        { featureKey: 'max_users', featureType: 'number', featureValue: 10 },
        { featureKey: 'custom_domain', featureType: 'boolean', featureValue: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a code with uppercase letters', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: 'Starter' });
    expect(result.success).toBe(false);
  });

  it('rejects a code with spaces', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: 'my plan' });
    expect(result.success).toBe(false);
  });

  it('rejects empty code', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: '' });
    expect(result.success).toBe(false);
  });

  it('rejects code longer than 50 chars', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createPlanSchema.safeParse({ ...validBase, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing billingOptions', () => {
    const { billingOptions: _, ...rest } = validBase;
    const result = createPlanSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty billingOptions array', () => {
    const result = createPlanSchema.safeParse({ ...validBase, billingOptions: [] });
    expect(result.success).toBe(false);
  });

  it('rejects billingOption with price = 0', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'monthly', price: 0, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects billingOption with negative price', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'monthly', price: -5, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects billingOption currency not 3 chars', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'monthly', price: 10, currency: 'US' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid billingCycle', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'weekly', price: 10, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid featureType', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      features: [{ featureKey: 'x', featureType: 'date', featureValue: true }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects sortOrder below 0', () => {
    const result = createPlanSchema.safeParse({ ...validBase, sortOrder: -1 });
    expect(result.success).toBe(false);
  });
});

describe('updatePlanSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = updatePlanSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with only name', () => {
    const result = updatePlanSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('still rejects invalid code format when code is provided', () => {
    const result = updatePlanSchema.safeParse({ code: 'BAD CODE' });
    expect(result.success).toBe(false);
  });

  it('still rejects price <= 0 when billingOptions is provided', () => {
    const result = updatePlanSchema.safeParse({
      billingOptions: [{ billingCycle: 'monthly', price: 0, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail (module not found)**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx jest tests/unit/dto/plan.dto.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@common/dto/plan.dto'`

- [ ] **Step 3: Implement the DTO file**

Create `src/common/dto/plan.dto.ts`:

```ts
import { z } from 'zod';
import { PlanBillingCycle } from '@database/entities/plan.entity';
import { PlanFeatureType } from '@database/entities/plan-feature.entity';

const billingOptionSchema = z.object({
  billingCycle: z.nativeEnum(PlanBillingCycle),
  price: z.number().finite().positive(),
  currency: z.string().length(3),
});

const featureSchema = z.object({
  featureKey: z.string().min(1).max(100),
  featureType: z.nativeEnum(PlanFeatureType),
  featureValue: z.unknown(),
});

export const createPlanSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'code must be lowercase alphanumeric with dashes or underscores'),
  name: z.string().min(1).max(255).trim(),
  description: z.string().trim().optional(),
  billingOptions: z.array(billingOptionSchema).min(1),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  features: z.array(featureSchema).default([]),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanDTO = z.infer<typeof createPlanSchema>;
export type UpdatePlanDTO = z.infer<typeof updatePlanSchema>;
```

- [ ] **Step 4: Run tests — expect them to pass**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx jest tests/unit/dto/plan.dto.test.ts --no-coverage
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/common/dto/plan.dto.ts tests/unit/dto/plan.dto.test.ts
git commit -m "feat: add plan DTO schemas with validation"
```

---

## Task 2: Plan Service

**Files:**
- Create: `src/services/plan.service.ts`
- Modify: `src/services/index.ts`
- Create: `tests/unit/services/plan.service.test.ts`

**Interfaces:**
- Consumes: `CreatePlanDTO`, `UpdatePlanDTO` from `@common/dto/plan.dto` (Task 1)
- Produces: `PlanService` class and `planService` singleton — consumed by Task 3 (controller)
  - `listPlans(): Promise<Plan[]>`
  - `getPlan(id: string): Promise<Plan>`
  - `createPlan(data: CreatePlanDTO): Promise<Plan>`
  - `updatePlan(id: string, data: UpdatePlanDTO): Promise<Plan>`
  - `deletePlan(id: string): Promise<void>`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/services/plan.service.test.ts`:

```ts
const mockPlanTxRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockFeatureTxRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
const mockEm = {
  getRepository: jest.fn((entity: unknown) => {
    const { Plan } = require('@database/entities');
    return entity === Plan ? mockPlanTxRepo : mockFeatureTxRepo;
  }),
};

jest.mock('@database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockBaseRepo),
    transaction: jest.fn(),
  },
}));

const mockBaseRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@database/repositories', () => ({
  planRepository: {
    find: jest.fn(),
    findWithFeatures: jest.fn(),
  },
  planFeatureRepository: {},
  tenantPlanRepository: {},
  userRepository: {},
  roleRepository: {},
  permissionRepository: {},
  tenantRepository: {},
  tenantPlanRepository: {},
  tenantSettingRepository: {},
  tenantDomainRepository: {},
  tenantConfigurationRepository: {},
  tenantUsageRepository: {},
  countryRepository: {},
  superAdminRepository: {},
}));

import { AppDataSource } from '@database/data-source';
import { planRepository } from '@database/repositories';
import { PlanService } from '@services/plan.service';

const mockPlanRepo = planRepository as jest.Mocked<typeof planRepository>;
const mockTransaction = AppDataSource.transaction as jest.Mock;

describe('PlanService', () => {
  let service: PlanService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlanService();
    mockTransaction.mockImplementation(async (cb: (em: unknown) => Promise<unknown>) => cb(mockEm));
  });

  // ── listPlans ──────────────────────────────────────────────────────────────

  describe('listPlans', () => {
    it('returns all plans ordered by sortOrder', async () => {
      const plans = [{ id: '1' }, { id: '2' }];
      mockPlanRepo.find.mockResolvedValue(plans as never);

      const result = await service.listPlans();

      expect(mockPlanRepo.find).toHaveBeenCalledWith({
        relations: ['features'],
        order: { sortOrder: 'ASC' },
      });
      expect(result).toEqual(plans);
    });
  });

  // ── getPlan ────────────────────────────────────────────────────────────────

  describe('getPlan', () => {
    it('returns plan when found', async () => {
      const plan = { id: 'plan-1', features: [] };
      mockPlanRepo.findWithFeatures.mockResolvedValue(plan as never);

      const result = await service.getPlan('plan-1');
      expect(result).toEqual(plan);
    });

    it('throws NotFoundException when plan does not exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(null);

      await expect(service.getPlan('missing-id')).rejects.toThrow('Plan not found');
    });
  });

  // ── createPlan ─────────────────────────────────────────────────────────────

  describe('createPlan', () => {
    const createData = {
      code: 'starter',
      name: 'Starter',
      billingOptions: [{ billingCycle: 'monthly' as const, price: 29, currency: 'USD' }],
      isPublic: true,
      isActive: true,
      sortOrder: 0,
      features: [{ featureKey: 'max_users', featureType: 'number' as const, featureValue: 10 }],
    };

    it('throws ConflictException when code already exists', async () => {
      mockPlanTxRepo.findOne.mockResolvedValue({ id: 'existing', code: 'starter' });

      await expect(service.createPlan(createData)).rejects.toThrow('Plan code already in use');
    });

    it('creates plan and features inside a transaction', async () => {
      mockPlanTxRepo.findOne.mockResolvedValue(null);
      const savedPlan = { id: 'new-plan-id', ...createData };
      mockPlanTxRepo.create.mockReturnValue(savedPlan);
      mockPlanTxRepo.save.mockResolvedValue(savedPlan);
      const feature = { id: 'feat-1', planId: 'new-plan-id' };
      mockFeatureTxRepo.create.mockReturnValue(feature);
      mockFeatureTxRepo.save.mockResolvedValue([feature]);
      // getPlan called after transaction
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...savedPlan, features: [feature] } as never);

      const result = await service.createPlan(createData);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockPlanTxRepo.save).toHaveBeenCalled();
      expect(mockFeatureTxRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('new-plan-id');
    });

    it('skips feature insert when features array is empty', async () => {
      mockPlanTxRepo.findOne.mockResolvedValue(null);
      const savedPlan = { id: 'new-plan-id' };
      mockPlanTxRepo.create.mockReturnValue(savedPlan);
      mockPlanTxRepo.save.mockResolvedValue(savedPlan);
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...savedPlan, features: [] } as never);

      await service.createPlan({ ...createData, features: [] });

      expect(mockFeatureTxRepo.save).not.toHaveBeenCalled();
    });
  });

  // ── updatePlan ─────────────────────────────────────────────────────────────

  describe('updatePlan', () => {
    const existingPlan = { id: 'plan-1', code: 'starter', name: 'Starter', features: [] };

    it('throws NotFoundException when plan does not exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(null);

      await expect(service.updatePlan('missing', { name: 'New' })).rejects.toThrow('Plan not found');
    });

    it('throws ConflictException when new code is already taken by another plan', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(existingPlan as never);
      mockPlanTxRepo.findOne.mockResolvedValue({ id: 'other-plan', code: 'business' });

      await expect(service.updatePlan('plan-1', { code: 'business' })).rejects.toThrow(
        'Plan code already in use',
      );
    });

    it('updates plan fields and replaces features when features are provided', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...existingPlan } as never);
      mockPlanTxRepo.findOne.mockResolvedValue(null);
      mockPlanTxRepo.save.mockResolvedValue({ ...existingPlan, name: 'Updated' });
      const newFeature = { featureKey: 'k', featureType: 'boolean' as const, featureValue: true };
      mockFeatureTxRepo.create.mockReturnValue({ id: 'f1', planId: 'plan-1', ...newFeature });
      mockFeatureTxRepo.save.mockResolvedValue([]);
      mockPlanRepo.findWithFeatures.mockResolvedValueOnce(existingPlan as never)
        .mockResolvedValueOnce({ ...existingPlan, name: 'Updated', features: [newFeature] } as never);

      const result = await service.updatePlan('plan-1', { name: 'Updated', features: [newFeature] });

      expect(mockFeatureTxRepo.delete).toHaveBeenCalledWith({ planId: 'plan-1' });
      expect(mockFeatureTxRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('does not touch features when features field is not provided', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...existingPlan } as never)
        .mockResolvedValue({ ...existingPlan } as never);
      mockPlanTxRepo.save.mockResolvedValue(existingPlan);

      await service.updatePlan('plan-1', { name: 'Only Name Change' });

      expect(mockFeatureTxRepo.delete).not.toHaveBeenCalled();
    });

    it('skips code uniqueness check when code is unchanged', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ ...existingPlan } as never);
      mockPlanTxRepo.save.mockResolvedValue(existingPlan);

      await service.updatePlan('plan-1', { code: 'starter' }); // same code

      expect(mockPlanTxRepo.findOne).not.toHaveBeenCalled();
    });
  });

  // ── deletePlan ─────────────────────────────────────────────────────────────

  describe('deletePlan', () => {
    it('throws NotFoundException when plan does not exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue(null);

      await expect(service.deletePlan('missing')).rejects.toThrow('Plan not found');
    });

    it('throws BadRequestException with tenant count when active subscriptions exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ id: 'plan-1' } as never);
      mockBaseRepo.count.mockResolvedValue(3);

      await expect(service.deletePlan('plan-1')).rejects.toThrow(
        'Cannot delete plan: 3 tenant(s) have an active subscription on this plan',
      );
    });

    it('hard-deletes plan when no active subscriptions exist', async () => {
      mockPlanRepo.findWithFeatures.mockResolvedValue({ id: 'plan-1' } as never);
      mockBaseRepo.count.mockResolvedValue(0);
      mockBaseRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deletePlan('plan-1');

      expect(mockBaseRepo.delete).toHaveBeenCalledWith('plan-1');
    });
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail (module not found)**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx jest tests/unit/services/plan.service.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@services/plan.service'`

- [ ] **Step 3: Implement the service**

Create `src/services/plan.service.ts`:

```ts
import { In } from 'typeorm';
import { AppDataSource } from '@database/data-source';
import { Plan, PlanFeature, TenantPlan } from '@database/entities';
import { planRepository } from '@database/repositories';
import { TenantPlanStatus } from '@common/enums/tenant.enums';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@common/exceptions/app.exception';
import type { CreatePlanDTO, UpdatePlanDTO } from '@common/dto/plan.dto';

export class PlanService {
  private planRepo = AppDataSource.getRepository(Plan);
  private tenantPlanRepo = AppDataSource.getRepository(TenantPlan);

  async listPlans(): Promise<Plan[]> {
    return planRepository.find({
      relations: ['features'],
      order: { sortOrder: 'ASC' },
    });
  }

  async getPlan(id: string): Promise<Plan> {
    const plan = await planRepository.findWithFeatures(id);
    if (!plan) throw new NotFoundException('Plan');
    return plan;
  }

  async createPlan(data: CreatePlanDTO): Promise<Plan> {
    let createdId!: string;

    await AppDataSource.transaction(async (em) => {
      const planRepo = em.getRepository(Plan);
      const featureRepo = em.getRepository(PlanFeature);

      const existing = await planRepo.findOne({ where: { code: data.code } });
      if (existing) throw new ConflictException('Plan code already in use');

      const { features, ...planFields } = data;
      const plan = planRepo.create(planFields);
      const saved = await planRepo.save(plan);
      createdId = saved.id;

      if (features.length > 0) {
        const featureEntities = features.map((f) =>
          featureRepo.create({ ...f, planId: saved.id }),
        );
        await featureRepo.save(featureEntities);
      }
    });

    return this.getPlan(createdId);
  }

  async updatePlan(id: string, data: UpdatePlanDTO): Promise<Plan> {
    const plan = await this.getPlan(id);

    await AppDataSource.transaction(async (em) => {
      const planRepo = em.getRepository(Plan);
      const featureRepo = em.getRepository(PlanFeature);

      if (data.code && data.code !== plan.code) {
        const conflict = await planRepo.findOne({ where: { code: data.code } });
        if (conflict) throw new ConflictException('Plan code already in use');
      }

      const { features, ...planFields } = data;
      Object.assign(plan, planFields);
      await planRepo.save(plan);

      if (features !== undefined) {
        await featureRepo.delete({ planId: id });
        if (features.length > 0) {
          const featureEntities = features.map((f) =>
            featureRepo.create({ ...f, planId: id }),
          );
          await featureRepo.save(featureEntities);
        }
      }
    });

    return this.getPlan(id);
  }

  async deletePlan(id: string): Promise<void> {
    await this.getPlan(id);

    const activeCount = await this.tenantPlanRepo.count({
      where: {
        planId: id,
        status: In([TenantPlanStatus.ACTIVE, TenantPlanStatus.TRIAL, TenantPlanStatus.PAUSED]),
      },
    });

    if (activeCount > 0) {
      throw new BadRequestException(
        `Cannot delete plan: ${activeCount} tenant(s) have an active subscription on this plan`,
      );
    }

    await this.planRepo.delete(id);
  }
}

export const planService = new PlanService();
```

- [ ] **Step 4: Export from services index**

Add to `src/services/index.ts`:

```ts
export { PlanService, planService } from './plan.service';
```

- [ ] **Step 5: Run tests — expect them to pass**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx jest tests/unit/services/plan.service.test.ts --no-coverage
```

Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/services/plan.service.ts src/services/index.ts tests/unit/services/plan.service.test.ts
git commit -m "feat: add PlanService with list/get/create/update/delete"
```

---

## Task 3: Controller + Routes

**Files:**
- Create: `src/controllers/plan.controller.ts`
- Modify: `src/routes/v1/super-admin.routes.ts`

**Interfaces:**
- Consumes: `planService` from `@services/plan.service` (Task 2); `createPlanSchema`, `updatePlanSchema` from `@common/dto/plan.dto` (Task 1)
- Produces: 5 Express handler exports (`listPlans`, `getPlan`, `createPlan`, `updatePlan`, `deletePlan`) mounted at `/admin/plans`

- [ ] **Step 1: Create the controller**

Create `src/controllers/plan.controller.ts`:

```ts
import { Request, Response, NextFunction } from 'express';
import { planService } from '@services/plan.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import type { CreatePlanDTO, UpdatePlanDTO } from '@common/dto/plan.dto';

export async function listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await planService.listPlans();
    ApiResponse.success(res, plans);
  } catch (error) {
    next(error);
  }
}

export async function getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.getPlan(req.params.id);
    ApiResponse.success(res, plan);
  } catch (error) {
    next(error);
  }
}

export async function createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.createPlan(req.body as CreatePlanDTO);
    ApiResponse.created(res, plan);
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.updatePlan(req.params.id, req.body as UpdatePlanDTO);
    ApiResponse.success(res, plan);
  } catch (error) {
    next(error);
  }
}

export async function deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await planService.deletePlan(req.params.id);
    ApiResponse.noContent(res);
  } catch (error) {
    next(error);
  }
}
```

- [ ] **Step 2: Mount routes in super-admin.routes.ts**

Open `src/routes/v1/super-admin.routes.ts`. The current file ends after the `createAdmin` route. Add the plan imports and routes. The complete updated file:

```ts
import { Router } from 'express';
import { checkSuperAdmin } from '@common/middlewares/super-admin-auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { loginSuperAdminSchema, createSuperAdminSchema } from '@common/dto/super-admin.dto';
import { createPlanSchema, updatePlanSchema } from '@common/dto/plan.dto';
import { login, me, createAdmin } from '@controllers/super-admin.controller';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan } from '@controllers/plan.controller';

export const superAdminRoutes: Router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
superAdminRoutes.post('/auth/login', validate(loginSuperAdminSchema), login);
superAdminRoutes.get('/auth/me', checkSuperAdmin(), me);
superAdminRoutes.post('/auth/create', checkSuperAdmin(), validate(createSuperAdminSchema), createAdmin);

// ── Plans ─────────────────────────────────────────────────────────────────────
superAdminRoutes.get('/plans', checkSuperAdmin(), listPlans);
superAdminRoutes.post('/plans', checkSuperAdmin(), validate(createPlanSchema), createPlan);
superAdminRoutes.get('/plans/:id', checkSuperAdmin(), getPlan);
superAdminRoutes.patch('/plans/:id', checkSuperAdmin(), validate(updatePlanSchema), updatePlan);
superAdminRoutes.delete('/plans/:id', checkSuperAdmin(), deletePlan);
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/controllers/plan.controller.ts src/routes/v1/super-admin.routes.ts
git commit -m "feat: add plan controller and routes under /admin/plans"
```

---

## Task 4: Swagger Docs

**Files:**
- Create: `src/docs/plan.docs.ts`
- Modify: `src/docs/index.ts`

**Interfaces:**
- Consumes: `createPlanSchema`, `updatePlanSchema` from `@common/dto/plan.dto` (Task 1); `registry` from `@config/swagger.config`
- Produces: Swagger UI documentation for all 5 plan endpoints under tag `Super Admin — Plans`

- [ ] **Step 1: Create plan.docs.ts**

Create `src/docs/plan.docs.ts`:

```ts
import { z } from 'zod';
import { registry } from '@config/swagger.config';
import { createPlanSchema, updatePlanSchema } from '@common/dto/plan.dto';

// ── Schemas ───────────────────────────────────────────────────────────────────

const BillingOptionSchema = registry.register(
  'BillingOption',
  z.object({
    billingCycle: z.enum(['monthly', 'yearly', 'custom']),
    price: z.number().positive(),
    currency: z.string().length(3),
  }),
);

const PlanFeatureSchema = registry.register(
  'PlanFeature',
  z.object({
    id: z.string().uuid(),
    planId: z.string().uuid(),
    featureKey: z.string(),
    featureType: z.enum(['boolean', 'number', 'string', 'list']),
    featureValue: z.unknown(),
    createdAt: z.string().datetime(),
  }),
);

const PlanSchema = registry.register(
  'Plan',
  z.object({
    id: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    billingOptions: z.array(BillingOptionSchema),
    isPublic: z.boolean(),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
    features: z.array(PlanFeatureSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const CreatePlanBody = registry.register(
  'CreatePlanBody',
  createPlanSchema.openapi({
    example: {
      code: 'starter',
      name: 'Starter Plan',
      description: 'For small teams',
      billingOptions: [
        { billingCycle: 'monthly', price: 29.99, currency: 'USD' },
        { billingCycle: 'yearly', price: 299, currency: 'USD' },
      ],
      isPublic: true,
      isActive: true,
      sortOrder: 1,
      features: [
        { featureKey: 'max_users', featureType: 'number', featureValue: 10 },
        { featureKey: 'custom_domain', featureType: 'boolean', featureValue: false },
      ],
    },
  }),
);

const UpdatePlanBody = registry.register(
  'UpdatePlanBody',
  updatePlanSchema.openapi({
    example: {
      name: 'Starter Plan (Updated)',
      isActive: false,
    },
  }),
);

const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });
const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

// ── Paths ─────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/admin/plans',
  tags: ['Super Admin — Plans'],
  summary: 'List all plans with features',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'All plans ordered by sortOrder',
      content: { 'application/json': { schema: SuccessData(z.array(PlanSchema)) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/plans',
  tags: ['Super Admin — Plans'],
  summary: 'Create a new plan with features',
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreatePlanBody } } } },
  responses: {
    201: {
      description: 'Plan created',
      content: { 'application/json': { schema: SuccessData(PlanSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    409: { description: 'Plan code already in use', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/plans/{id}',
  tags: ['Super Admin — Plans'],
  summary: 'Get a plan by ID with features',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: 'Plan found',
      content: { 'application/json': { schema: SuccessData(PlanSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Plan not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/admin/plans/{id}',
  tags: ['Super Admin — Plans'],
  summary: 'Update a plan — providing features replaces all existing features',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdatePlanBody } } },
  },
  responses: {
    200: {
      description: 'Plan updated',
      content: { 'application/json': { schema: SuccessData(PlanSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Plan not found', content: { 'application/json': { schema: ErrorResponse } } },
    409: { description: 'Plan code already in use', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/admin/plans/{id}',
  tags: ['Super Admin — Plans'],
  summary: 'Delete a plan — blocked if any tenants have active subscriptions',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: 'Plan deleted' },
    400: {
      description: 'Cannot delete — active tenant subscriptions exist',
      content: { 'application/json': { schema: ErrorResponse } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Plan not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
```

- [ ] **Step 2: Import in docs/index.ts**

Open `src/docs/index.ts` and add the import (after the existing super-admin and user imports):

```ts
import '@config/swagger.config'; // must be first — calls extendZodWithOpenApi
import './super-admin.docs';
import './user.docs';
import './plan.docs';

import { generateSwaggerSpec } from '@config/swagger.config';

export const swaggerSpec: object = generateSwaggerSpec();
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Run the full unit test suite to confirm no regressions**

```bash
cd /Users/bishal/Documents/GitHub/nepex-cargo-project/backend
npx jest tests/unit --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/docs/plan.docs.ts src/docs/index.ts
git commit -m "feat: add Swagger docs for super-admin plan routes"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in |
|-----------------|-----------|
| `GET /admin/plans` — list with features | Task 3 route, Task 2 `listPlans`, Task 4 docs |
| `POST /admin/plans` — create with features | Task 3 route, Task 2 `createPlan`, Task 1 DTO, Task 4 docs |
| `GET /admin/plans/:id` — get single plan | Task 3 route, Task 2 `getPlan`, Task 4 docs |
| `PATCH /admin/plans/:id` — update + replace features | Task 3 route, Task 2 `updatePlan`, Task 1 DTO, Task 4 docs |
| `DELETE /admin/plans/:id` — block if active tenants | Task 2 `deletePlan` (counts ACTIVE/TRIAL/PAUSED), Task 4 docs |
| `code` format validation | Task 1 DTO regex + test |
| `billingOptions` min 1 item | Task 1 DTO + test |
| `currency` exactly 3 chars | Task 1 DTO + test |
| `price` > 0 | Task 1 DTO + test |
| `sortOrder` ≥ 0 | Task 1 DTO + test |
| Features default `[]` | Task 1 DTO default |
| `updatePlanSchema` fully partial | Task 1 DTO `.partial()` + test |
| All routes behind `checkSuperAdmin()` | Task 3 routes |
| Transaction for write ops | Task 2 `createPlan` + `updatePlan` |
| No features touched on PATCH without features key | Task 2 `updatePlan` + test |
| No migrations needed | No migration task — tables already exist ✓ |

All requirements covered. No placeholders. Type names are consistent across tasks.
