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

// ── Import/Export Paths ───────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/tenant/zones/sample',
  tags: ['Tenant — Zones'],
  summary: 'Download a sample zones CSV/Excel template for import',
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({ format: z.enum(['csv', 'xlsx']).optional().describe('Output format (default: xlsx)') }),
  },
  responses: {
    200: { description: 'Sample file download (text/csv or .xlsx)' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tenant/zones/export',
  tags: ['Tenant — Zones'],
  summary: 'Export all zones as CSV/Excel (partner_owner or manager)',
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({ format: z.enum(['csv', 'xlsx']).optional().describe('Output format (default: xlsx)') }),
  },
  responses: {
    200: { description: 'Zones file download (text/csv or .xlsx)' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tenant/zones/import',
  tags: ['Tenant — Zones'],
  summary: 'Import zones from a CSV/Excel file (partner_owner or manager). Upserts by zone_name.',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      description: 'Multipart file upload (field name: file). Columns: zone_name, country (ISO2).',
      content: { 'multipart/form-data': { schema: z.object({ file: z.instanceof(File) }) } },
    },
  },
  responses: {
    202: {
      description: 'Import queued — poll /tenant/import/status/{jobId} for result',
      content: {
        'application/json': {
          schema: SuccessData(z.object({ jobId: z.string(), message: z.string() })),
        },
      },
    },
    400: { description: 'No file or invalid format', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tenant/rates/sample',
  tags: ['Tenant — Rate Cards'],
  summary: 'Download a sample rates CSV/Excel template for import',
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({ format: z.enum(['csv', 'xlsx']).optional().describe('Output format (default: xlsx)') }),
  },
  responses: {
    200: { description: 'Sample file download (text/csv or .xlsx)' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tenant/rates/export',
  tags: ['Tenant — Rate Cards'],
  summary: 'Export all rate cards as a weight × zone matrix CSV/Excel (partner_owner or manager)',
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({ format: z.enum(['csv', 'xlsx']).optional().describe('Output format (default: xlsx)') }),
  },
  responses: {
    200: { description: 'Rates matrix file download (text/csv or .xlsx)' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tenant/rates/import',
  tags: ['Tenant — Rate Cards'],
  summary: 'Import rates from a weight × zone matrix CSV/Excel (partner_owner or manager). Upserts rate cards and tiers.',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      description: 'Multipart file upload (field name: file). Columns: weight_kg, <zone names...>, type, origin_country.',
      content: { 'multipart/form-data': { schema: z.object({ file: z.instanceof(File) }) } },
    },
  },
  responses: {
    202: {
      description: 'Import queued — poll /tenant/import/status/{jobId} for result',
      content: {
        'application/json': {
          schema: SuccessData(z.object({ jobId: z.string(), message: z.string() })),
        },
      },
    },
    400: { description: 'No file or invalid format', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Insufficient role', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tenant/import/status/{jobId}',
  tags: ['Tenant — Zones', 'Tenant — Rate Cards'],
  summary: 'Poll the status of a zone or rate import job',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ jobId: z.string() }) },
  responses: {
    200: {
      description: 'Job status',
      content: {
        'application/json': {
          schema: SuccessData(
            z.object({
              jobId: z.string(),
              state: z.enum(['waiting', 'active', 'completed', 'failed', 'delayed', 'unknown']),
              result: z.record(z.unknown()).optional().describe('Present when state=completed'),
              error: z.string().optional().describe('Present when state=failed'),
            }),
          ),
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Job not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

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
