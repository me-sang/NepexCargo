import { Router } from 'express';
import { checkSuperAdmin } from '@common/middlewares/super-admin-auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { loginSuperAdminSchema, createSuperAdminSchema } from '@common/dto/super-admin.dto';
import { createPlanSchema, updatePlanSchema } from '@common/dto/plan.dto';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  listSubscriptionsQuerySchema,
} from '@common/dto/subscription.dto';
import { login, me, createAdmin } from '@controllers/super-admin.controller';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan } from '@controllers/plan.controller';
import {
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '@controllers/subscription.controller';

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

// ── Subscriptions ─────────────────────────────────────────────────────────────
superAdminRoutes.get('/subscriptions', checkSuperAdmin(), validate(listSubscriptionsQuerySchema, 'query'), listSubscriptions);
superAdminRoutes.post('/subscriptions', checkSuperAdmin(), validate(createSubscriptionSchema), createSubscription);
superAdminRoutes.get('/subscriptions/:id', checkSuperAdmin(), getSubscription);
superAdminRoutes.patch('/subscriptions/:id', checkSuperAdmin(), validate(updateSubscriptionSchema), updateSubscription);
superAdminRoutes.delete('/subscriptions/:id', checkSuperAdmin(), deleteSubscription);
