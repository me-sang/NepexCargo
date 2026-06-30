import { z } from 'zod';
import { registry } from '@config/swagger.config';
import { createZoneSchema, updateZoneSchema, updateRateCardSchema } from '@common/dto/rate.dto';
import { RateCardType, WeightUnit } from '@common/enums/rate.enums';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });

const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

const idParam = z.object({ id: z.string().uuid() });

// ── Schemas ───────────────────────────────────────────────────────────────────

const WeightTierSchema = registry.register(
  'WeightTier',
  z.object({
    id: z.string().uuid(),
    rateCardId: z.string().uuid(),
    minWeight: z.number(),
    maxWeight: z.number().nullable(),
    pricePerUnit: z.number(),
    flatPrice: z.number().nullable(),
  }),
);

const ZoneSchema = registry.register(
  'Zone',
  z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    name: z.string(),
    zoneFor: z.array(z.string()).nullable().optional(),
    countries: z.array(z.string()),
    cities: z.array(z.string()),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const RateCardSchema = registry.register(
  'RateCard',
  z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    name: z.string().nullable(),
    type: z.nativeEnum(RateCardType),
    currency: z.string(),
    weightUnit: z.nativeEnum(WeightUnit),
    active: z.boolean(),
    integrationId: z.string().uuid().nullable(),
    originZoneId: z.string().uuid().nullable(),
    destinationZoneId: z.string().uuid().nullable(),
    originZone: ZoneSchema.nullable().optional(),
    destinationZone: ZoneSchema.nullable().optional(),
    originCountry: z.string().nullable(),
    originCity: z.string().nullable(),
    destinationCountry: z.string().nullable(),
    destinationCity: z.string().nullable(),
    weightTiers: z.array(WeightTierSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const CreateZoneBody = registry.register('CreateZoneBody', createZoneSchema);
const UpdateZoneBody = registry.register('UpdateZoneBody', updateZoneSchema);

// createRateCardSchema is a discriminatedUnion — register both variants separately
const WeightTierInput = z.object({
  minWeight: z.number().min(0),
  maxWeight: z.number().positive().nullable().optional(),
  pricePerUnit: z.number().positive(),
  flatPrice: z.number().min(0).nullable().optional(),
});

const CreateZoneRateCardBody = registry.register(
  'CreateZoneRateCardBody',
  z.object({
    type: z.literal(RateCardType.ZONE),
    name: z.string().optional(),
    currency: z.string().length(3).optional(),
    weightUnit: z.nativeEnum(WeightUnit).optional(),
    integrationId: z.string().uuid().optional(),
    originZoneId: z.string().uuid(),
    destinationZoneId: z.string().uuid(),
    weightTiers: z.array(WeightTierInput).min(1),
  }),
);

const CreateRouteRateCardBody = registry.register(
  'CreateRouteRateCardBody',
  z.object({
    type: z.literal(RateCardType.ROUTE),
    name: z.string().optional(),
    currency: z.string().length(3).optional(),
    weightUnit: z.nativeEnum(WeightUnit).optional(),
    integrationId: z.string().uuid().optional(),
    originCountry: z.string().length(2),
    originCity: z.string().optional(),
    destinationCountry: z.string().length(2),
    destinationCity: z.string().optional(),
    weightTiers: z.array(WeightTierInput).min(1),
  }),
);

const UpdateRateCardBody = registry.register('UpdateRateCardBody', updateRateCardSchema);

// ── Zone Paths ────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/tenant/zones',
  tags: ['Tenant — Zones'],
  summary: 'List all zones for the current tenant',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Zones list',
      content: { 'application/json': { schema: SuccessData(z.array(ZoneSchema)) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tenant/zones/{id}',
  tags: ['Tenant — Zones'],
  summary: 'Get a zone by ID',
  security: [{ BearerAuth: [] }],
  request: { params: idParam },
  responses: {
    200: {
      description: 'Zone found',
      content: { 'application/json': { schema: SuccessData(ZoneSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Zone not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tenant/zones',
  tags: ['Tenant — Zones'],
  summary: 'Create a zone (partner_owner or manager)',
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateZoneBody } } } },
  responses: {
    201: {
      description: 'Zone created',
      content: { 'application/json': { schema: SuccessData(ZoneSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/tenant/zones/{id}',
  tags: ['Tenant — Zones'],
  summary: 'Update a zone (partner_owner or manager)',
  security: [{ BearerAuth: [] }],
  request: {
    params: idParam,
    body: { content: { 'application/json': { schema: UpdateZoneBody } } },
  },
  responses: {
    200: {
      description: 'Zone updated',
      content: { 'application/json': { schema: SuccessData(ZoneSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Zone not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/tenant/zones/{id}',
  tags: ['Tenant — Zones'],
  summary: 'Delete a zone (partner_owner or manager)',
  security: [{ BearerAuth: [] }],
  request: { params: idParam },
  responses: {
    204: { description: 'Zone deleted' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Zone not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// ── Rate Card Paths ───────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/tenant/rates',
  tags: ['Tenant — Rate Cards'],
  summary: 'List all rate cards for the current tenant (includes weight tiers and zones)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Rate cards list',
      content: { 'application/json': { schema: SuccessData(z.array(RateCardSchema)) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tenant/rates/{id}',
  tags: ['Tenant — Rate Cards'],
  summary: 'Get a rate card by ID (includes weight tiers and zones)',
  security: [{ BearerAuth: [] }],
  request: { params: idParam },
  responses: {
    200: {
      description: 'Rate card found',
      content: { 'application/json': { schema: SuccessData(RateCardSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Rate card not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tenant/rates',
  tags: ['Tenant — Rate Cards'],
  summary: 'Create a rate card with weight tiers (partner_owner or manager). type=zone requires originZoneId + destinationZoneId; type=route requires originCountry + destinationCountry.',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.union([CreateZoneRateCardBody, CreateRouteRateCardBody]),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Rate card created',
      content: { 'application/json': { schema: SuccessData(RateCardSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/tenant/rates/{id}',
  tags: ['Tenant — Rate Cards'],
  summary: 'Update a rate card (partner_owner or manager). Providing weightTiers replaces all existing tiers.',
  security: [{ BearerAuth: [] }],
  request: {
    params: idParam,
    body: { content: { 'application/json': { schema: UpdateRateCardBody } } },
  },
  responses: {
    200: {
      description: 'Rate card updated',
      content: { 'application/json': { schema: SuccessData(RateCardSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Rate card not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/tenant/rates/{id}',
  tags: ['Tenant — Rate Cards'],
  summary: 'Delete a rate card and its weight tiers (partner_owner or manager)',
  security: [{ BearerAuth: [] }],
  request: { params: idParam },
  responses: {
    204: { description: 'Rate card deleted' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Rate card not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
