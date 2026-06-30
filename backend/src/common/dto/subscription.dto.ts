import { z } from 'zod';
import { TenantPlanStatus, TenantPlanRenewalType } from '@common/enums/tenant.enums';

export const createSubscriptionSchema = z.object({
  tenantId: z.string().uuid(),
  planId: z.string().uuid(),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  renewalType: z.nativeEnum(TenantPlanRenewalType).optional(),
  status: z.nativeEnum(TenantPlanStatus).default(TenantPlanStatus.ACTIVE),
  autoRenew: z.boolean().default(true),
  billingCycle: z.number().int().positive().default(1),
  amount: z.number().finite().positive().optional(),
  currency: z.string().length(3).optional(),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().uuid().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  renewalType: z.nativeEnum(TenantPlanRenewalType).optional(),
  status: z.nativeEnum(TenantPlanStatus).optional(),
  autoRenew: z.boolean().optional(),
  billingCycle: z.number().int().positive().optional(),
  amount: z.number().finite().positive().optional(),
  currency: z.string().length(3).optional(),
});

export const listSubscriptionsQuerySchema = z.object({
  tenantId: z.string().uuid().optional(),
  status: z.nativeEnum(TenantPlanStatus).optional(),
});

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDTO = z.infer<typeof updateSubscriptionSchema>;
export type ListSubscriptionsQueryDTO = z.infer<typeof listSubscriptionsQuerySchema>;
