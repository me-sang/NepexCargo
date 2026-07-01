import { z } from 'zod';
import { BookingSource, BookingStatus, ProtectionType } from '@common/enums/booking.enums';
import { WeightUnit } from '@common/enums/rate.enums';

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const contactAddressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  zip: z.string().optional(),
  /** ISO 3166-1 alpha-2 */
  country: z.string().length(2).toUpperCase(),
});

const dimensionUnitEnum = z.enum(['cm', 'in']);

const shipmentItemSchema = z.object({
  weight: z.number().positive(),
  weightUnit: z.nativeEnum(WeightUnit),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    dimensionUnit: dimensionUnitEnum,
  }),
  additionalService: z.string().optional(),
  remarks: z.string().optional(),
  approxItemValue: z.number().min(0),
});

// ── Create ─────────────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  source: z.nativeEnum(BookingSource).default(BookingSource.MANUAL),
  rateCardId: z.string().uuid().optional(),
  integrationId: z.string().uuid().optional(),
  sender: contactAddressSchema,
  receiver: contactAddressSchema,
  shipmentDetails: z.array(shipmentItemSchema).min(1, 'At least one shipment item is required'),
  protectionType: z.nativeEnum(ProtectionType).default(ProtectionType.FREE),
  protectionValue: z.number().positive().optional(),
  currency: z.string().length(3).toUpperCase().default('NPR'),
  notes: z.string().optional(),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

// ── Update status ──────────────────────────────────────────────────────────────

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  notes: z.string().optional(),
});

export type UpdateBookingStatusDTO = z.infer<typeof updateBookingStatusSchema>;

// ── List query ─────────────────────────────────────────────────────────────────

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(BookingStatus).optional(),
});

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
