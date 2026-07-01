import { z } from 'zod';
import { BookingStatus, ProtectionType } from '@common/enums/booking.enums';
import { WeightUnit } from '@common/enums/rate.enums';

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const contactAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().length(2, 'Must be a 2-letter ISO country code').toUpperCase(),
});

const shipmentItemSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  weightUnit: z.nativeEnum(WeightUnit),
  dimensions: z.object({
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
    dimensionUnit: z.enum(['cm', 'in']),
  }),
  additionalService: z.string().optional(),
  remarks: z.string().optional(),
  approxItemValue: z.number().min(0, 'Item value cannot be negative'),
});

// ── Create ─────────────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  rateCardId: z.string().uuid('Invalid rate card ID'),
  sender: contactAddressSchema,
  receiver: contactAddressSchema,
  shipmentDetails: z
    .array(shipmentItemSchema)
    .min(1, 'At least one shipment item is required'),
  protectionType: z.nativeEnum(ProtectionType).default(ProtectionType.FREE),
  /** Required only when protectionType is INSURED */
  protectionValue: z.number().positive('Protection value must be positive').optional(),
  currency: z.string().length(3, 'Must be a 3-letter ISO currency code').toUpperCase().default('NPR'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
}).refine(
  (data) => data.protectionType !== ProtectionType.INSURED || data.protectionValue != null,
  { message: 'protectionValue is required when protectionType is insured', path: ['protectionValue'] },
);

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

// ── List query ─────────────────────────────────────────────────────────────────

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(BookingStatus).optional(),
});

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
