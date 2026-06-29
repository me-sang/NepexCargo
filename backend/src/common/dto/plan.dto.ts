import { z } from 'zod';
import { PlanBillingCycle } from '@database/entities/plan.entity';
import { PlanFeatureType } from '@database/entities/plan-feature.entity';

const billingOptionSchema = z.object({
  billingCycle: z.nativeEnum(PlanBillingCycle),
  price: z.number().finite().positive(),
  currency: z.string().length(3),
});

const featureSchema = z.object({
  featureKey: z.string().min(1).max(100),
  featureType: z.nativeEnum(PlanFeatureType),
  featureValue: z.unknown(),
});

export const createPlanSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'code must be lowercase alphanumeric with dashes or underscores'),
  name: z.string().min(1).max(255).trim(),
  description: z.string().trim().optional(),
  billingOptions: z.array(billingOptionSchema).min(1),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  features: z.array(featureSchema).default([]),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanDTO = z.infer<typeof createPlanSchema>;
export type UpdatePlanDTO = z.infer<typeof updatePlanSchema>;
