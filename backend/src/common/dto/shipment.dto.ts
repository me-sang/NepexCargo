import { z } from 'zod';
import { WeightUnit } from '@common/enums/rate.enums';

export const checkRatesSchema = z.object({
  minWeight: z.number().positive('Weight must be a positive number'),
  weightUnit: z.nativeEnum(WeightUnit),
  sourceLocation: z.string().length(2, 'Must be a 2-letter ISO country code').toUpperCase(),
  destinationLocation: z.string().length(2, 'Must be a 2-letter ISO country code').toUpperCase(),
  locationType: z.literal('country'),
});

export type CheckRatesInput = z.infer<typeof checkRatesSchema>;
