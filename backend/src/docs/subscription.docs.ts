import { z } from 'zod';
import { registry } from '@config/swagger.config';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  listSubscriptionsQuerySchema,
} from '@common/dto/subscription.dto';

// ── Schemas ───────────────────────────────────────────────────────────────────

const SubscriptionSchema = registry.register(
  'Subscription',
  z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    planId: z.string().uuid(),
    startsAt: z.string().datetime(),
    expiresAt: z.string().datetime().nullable().optional(),
    renewalType: z.enum(['monthly', 'yearly', 'custom']).nullable().optional(),
    status: z.enum(['trial', 'active', 'expired', 'cancelled', 'paused']),
    autoRenew: z.boolean(),
    billingCycle: z.number().int(),
    amount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    tenant: z.object({
      id: z.string().uuid(),
      code: z.string(),
      legalName: z.string(),
      displayName: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    }).optional(),
    plan: z.object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
    }).optional(),
  }),
);

const CreateSubscriptionBody = registry.register('CreateSubscriptionBody', createSubscriptionSchema);
const UpdateSubscriptionBody = registry.register('UpdateSubscriptionBody', updateSubscriptionSchema);

const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });
const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

// ── Paths ─────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/admin/subscriptions',
  tags: ['Super Admin — Subscriptions'],
  summary: 'List all subscriptions (optionally filter by tenantId or status)',
  security: [{ BearerAuth: [] }],
  request: { query: listSubscriptionsQuerySchema },
  responses: {
    200: {
      description: 'Subscriptions list',
      content: { 'application/json': { schema: SuccessData(z.array(SubscriptionSchema)) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/subscriptions',
  tags: ['Super Admin — Subscriptions'],
  summary: 'Assign a plan to a tenant',
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateSubscriptionBody } } } },
  responses: {
    201: {
      description: 'Subscription created',
      content: { 'application/json': { schema: SuccessData(SubscriptionSchema) } },
    },
    400: { description: 'Plan inactive or validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Tenant or plan not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/subscriptions/{id}',
  tags: ['Super Admin — Subscriptions'],
  summary: 'Get a subscription by ID',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: 'Subscription found',
      content: { 'application/json': { schema: SuccessData(SubscriptionSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Subscription not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/admin/subscriptions/{id}',
  tags: ['Super Admin — Subscriptions'],
  summary: 'Update a subscription (status, expiry, plan, etc.)',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateSubscriptionBody } } },
  },
  responses: {
    200: {
      description: 'Subscription updated',
      content: { 'application/json': { schema: SuccessData(SubscriptionSchema) } },
    },
    400: { description: 'Plan inactive or validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Subscription or plan not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/admin/subscriptions/{id}',
  tags: ['Super Admin — Subscriptions'],
  summary: 'Cancel a subscription (sets status = cancelled, no data is removed)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: 'Subscription cancelled',
      content: { 'application/json': { schema: SuccessData(SubscriptionSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Subscription not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
