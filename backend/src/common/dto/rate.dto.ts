import { z } from 'zod';
import { RateCardType, WeightUnit } from '../enums/rate.enums';

// ── Zone ───────────────────────────────────────────────────────────────────────

export const createZoneSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  /** ISO 3166-1 alpha-2 country codes this zone is designated for. Omit if purpose-agnostic. */
  zoneFor: z.array(z.string().length(2).toUpperCase()).optional(),
  /** ISO 3166-1 alpha-2 codes. Must have at least one country. */
  countries: z.array(z.string().length(2).toUpperCase()).min(1),
  cities: z.array(z.string().min(1).max(255)).default([]),
});

export const updateZoneSchema = createZoneSchema.partial();

export type CreateZoneDTO = z.infer<typeof createZoneSchema>;
export type UpdateZoneDTO = z.infer<typeof updateZoneSchema>;

// ── WeightTier ─────────────────────────────────────────────────────────────────

export const weightTierSchema = z
  .object({
    minWeight: z.number().min(0),
    /** Omit or pass null for the final open-ended tier ("and above"). */
    maxWeight: z.number().positive().nullable().optional(),
    pricePerUnit: z.number().positive(),
    /** Optional flat surcharge added on top of per-unit price. */
    flatPrice: z.number().min(0).nullable().optional(),
  })
  .refine((t) => t.maxWeight == null || t.maxWeight > t.minWeight, {
    message: 'maxWeight must be greater than minWeight',
    path: ['maxWeight'],
  });

export type WeightTierDTO = z.infer<typeof weightTierSchema>;

// ── RateCard ───────────────────────────────────────────────────────────────────

const baseRateCardFields = {
  name: z.string().min(1).max(255).trim().optional(),
  /** ISO 4217 currency code, e.g. "USD". */
  currency: z.string().length(3).default('USD'),
  weightUnit: z.nativeEnum(WeightUnit).default(WeightUnit.KG),
  integrationId: z.string().uuid().optional(),
  weightTiers: z.array(weightTierSchema).min(1),
};

const zoneRateCardSchema = z.object({
  ...baseRateCardFields,
  type: z.literal(RateCardType.ZONE),
  /** Must reference a zone with zoneFor = ORIGIN or BOTH. */
  originZoneId: z.string().uuid(),
  /** Must reference a zone with zoneFor = DESTINATION or BOTH. */
  destinationZoneId: z.string().uuid(),
});

const routeRateCardSchema = z.object({
  ...baseRateCardFields,
  type: z.literal(RateCardType.ROUTE),
  originCountry: z.string().length(2),
  originCity: z.string().min(1).max(255).optional(),
  destinationCountry: z.string().length(2),
  destinationCity: z.string().min(1).max(255).optional(),
});

export const createRateCardSchema = z.discriminatedUnion('type', [
  zoneRateCardSchema,
  routeRateCardSchema,
]);

export const updateRateCardSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  currency: z.string().length(3).optional(),
  weightUnit: z.nativeEnum(WeightUnit).optional(),
  integrationId: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
  /** Replaces all existing tiers when provided. */
  weightTiers: z.array(weightTierSchema).min(1).optional(),
});

export type CreateRateCardDTO = z.infer<typeof createRateCardSchema>;
export type UpdateRateCardDTO = z.infer<typeof updateRateCardSchema>;

// ── Response shapes ────────────────────────────────────────────────────────────

export type WeightTierResponse = {
  id: string;
  minWeight: number;
  maxWeight: number | null;
  pricePerUnit: number;
  flatPrice: number | null;
};

export type ZoneResponse = {
  id: string;
  name: string;
  zoneFor?: string[];
  countries: string[];
  cities: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type RateCardResponse = {
  id: string;
  name: string | null;
  type: RateCardType;
  currency: string;
  weightUnit: WeightUnit;
  active: boolean;
  integrationId: string | null;
  // zone-based
  originZoneId: string | null;
  destinationZoneId: string | null;
  originZone?: ZoneResponse | null;
  destinationZone?: ZoneResponse | null;
  // route-based
  originCountry: string | null;
  originCity: string | null;
  destinationCountry: string | null;
  destinationCity: string | null;
  weightTiers: WeightTierResponse[];
  createdAt: Date;
  updatedAt: Date;
};
