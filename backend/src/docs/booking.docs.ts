import { z } from 'zod';
import { registry } from '@config/swagger.config';
import { createBookingSchema } from '@common/dto/booking.dto';
import { BookingSource, BookingStatus, ProtectionType } from '@common/enums/booking.enums';
import { WeightUnit } from '@common/enums/rate.enums';

const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });
const SuccessData = (dataSchema: z.ZodTypeAny) =>
  z.object({ success: z.literal(true), data: dataSchema });

const idParam = z.object({ id: z.string().uuid() });

// ── Schemas ───────────────────────────────────────────────────────────────────

const ContactAddressSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().length(2).describe('ISO 3166-1 alpha-2 country code'),
});

const ShipmentItemSchema = z.object({
  weight: z.number(),
  weightUnit: z.nativeEnum(WeightUnit),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    dimensionUnit: z.enum(['cm', 'in']),
  }),
  additionalService: z.string().optional(),
  remarks: z.string().optional(),
  approxItemValue: z.number(),
});

const BookingSchema = registry.register(
  'Booking',
  z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    airwayBillNumber: z.string(),
    source: z.nativeEnum(BookingSource),
    createdByUserId: z.string().uuid().nullable(),
    createdByAgentId: z.string().uuid().nullable(),
    rateCardId: z.string().uuid().nullable(),
    integrationId: z.string().uuid().nullable(),
    sender: ContactAddressSchema,
    receiver: ContactAddressSchema,
    shipmentDetails: z.array(ShipmentItemSchema),
    protectionType: z.nativeEnum(ProtectionType),
    protectionValue: z.number().nullable(),
    status: z.nativeEnum(BookingStatus),
    shippingCost: z.number().nullable(),
    protectionCost: z.number(),
    tax: z.number(),
    total: z.number().nullable(),
    currency: z.string(),
    notes: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const CreateBookingBody = registry.register('CreateBookingBody', createBookingSchema);

// ── Paths ─────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/bookings',
  tags: ['Bookings'],
  summary: 'List bookings created by the current user',
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().int().positive().optional().describe('Default 1'),
      limit: z.coerce.number().int().positive().max(100).optional().describe('Default 20, max 100'),
      status: z.nativeEnum(BookingStatus).optional(),
    }),
  },
  responses: {
    200: {
      description: 'Paginated bookings list',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(BookingSchema),
            meta: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/bookings',
  tags: ['Bookings'],
  summary: 'Create a booking',
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateBookingBody } } } },
  responses: {
    201: {
      description: 'Booking created',
      content: { 'application/json': { schema: SuccessData(BookingSchema) } },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/bookings/{id}',
  tags: ['Bookings'],
  summary: 'Get a booking by ID',
  security: [{ BearerAuth: [] }],
  request: { params: idParam },
  responses: {
    200: {
      description: 'Booking found',
      content: { 'application/json': { schema: SuccessData(BookingSchema) } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Booking not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/bookings/{id}/cancel',
  tags: ['Bookings'],
  summary: 'Cancel a booking (only by its creator, and only if not delivered/in transit)',
  security: [{ BearerAuth: [] }],
  request: { params: idParam },
  responses: {
    200: {
      description: 'Booking cancelled',
      content: { 'application/json': { schema: SuccessData(BookingSchema) } },
    },
    400: { description: 'Booking cannot be cancelled in its current state', content: { 'application/json': { schema: ErrorResponse } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
    403: { description: 'Not the booking creator', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Booking not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
