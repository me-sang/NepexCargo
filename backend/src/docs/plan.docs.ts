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

const CreatePlanBody = registry.register('CreatePlanBody', createPlanSchema);

const UpdatePlanBody = registry.register('UpdatePlanBody', updatePlanSchema);

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
  summary: 'Deactivate a plan (sets isActive = false, existing subscriptions unaffected)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: 'Plan deactivated',
      content: { 'application/json': { schema: SuccessData(PlanSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Plan not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
