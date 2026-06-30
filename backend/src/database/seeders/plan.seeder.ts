import { planRepository, planFeatureRepository } from '../repositories';
import { PlanBillingCycle } from '../entities/plan.entity';
import { PlanFeatureType, PlanFeatureKey } from '../entities/plan-feature.entity';

const plans = [
  {
    code: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started with cargo management.',
    isPublic: true,
    isActive: true,
    sortOrder: 1,
    billingOptions: [
      { billingCycle: PlanBillingCycle.MONTHLY, price: 0, currency: 'USD' },
      { billingCycle: PlanBillingCycle.YEARLY, price: 0, currency: 'USD' },
    ],
    features: [
      { featureKey: PlanFeatureKey.MAX_USERS, featureType: PlanFeatureType.NUMBER, featureValue: 5 },
      { featureKey: PlanFeatureKey.MAX_SHIPMENTS_PER_MONTH, featureType: PlanFeatureType.NUMBER, featureValue: 100 },
      { featureKey: PlanFeatureKey.CUSTOM_DOMAIN, featureType: PlanFeatureType.BOOLEAN, featureValue: false },
      { featureKey: PlanFeatureKey.API_ACCESS, featureType: PlanFeatureType.BOOLEAN, featureValue: false },
      { featureKey: PlanFeatureKey.SUPPORT_TIER, featureType: PlanFeatureType.STRING, featureValue: 'email' },
      { featureKey: PlanFeatureKey.ALLOWED_CARRIERS, featureType: PlanFeatureType.LIST, featureValue: ['DHL'] },
    ],
  },
  {
    code: 'business',
    name: 'Business',
    description: 'Built for growing businesses that need more power and integrations.',
    isPublic: true,
    isActive: true,
    sortOrder: 2,
    billingOptions: [
      { billingCycle: PlanBillingCycle.MONTHLY, price: 99, currency: 'USD' },
      { billingCycle: PlanBillingCycle.YEARLY, price: 990, currency: 'USD' },
    ],
    features: [
      { featureKey: PlanFeatureKey.MAX_USERS, featureType: PlanFeatureType.NUMBER, featureValue: 25 },
      { featureKey: PlanFeatureKey.MAX_SHIPMENTS_PER_MONTH, featureType: PlanFeatureType.NUMBER, featureValue: 1000 },
      { featureKey: PlanFeatureKey.CUSTOM_DOMAIN, featureType: PlanFeatureType.BOOLEAN, featureValue: true },
      { featureKey: PlanFeatureKey.API_ACCESS, featureType: PlanFeatureType.BOOLEAN, featureValue: true },
      { featureKey: PlanFeatureKey.SUPPORT_TIER, featureType: PlanFeatureType.STRING, featureValue: 'priority' },
      {
        featureKey: PlanFeatureKey.ALLOWED_CARRIERS,
        featureType: PlanFeatureType.LIST,
        featureValue: ['DHL', 'FedEx', 'Aramex'],
      },
    ],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    description: 'Full-featured plan for large operations with unlimited scale.',
    isPublic: true,
    isActive: true,
    sortOrder: 3,
    billingOptions: [
      { billingCycle: PlanBillingCycle.MONTHLY, price: 299, currency: 'USD' },
      { billingCycle: PlanBillingCycle.YEARLY, price: 2990, currency: 'USD' },
    ],
    features: [
      { featureKey: PlanFeatureKey.MAX_USERS, featureType: PlanFeatureType.NUMBER, featureValue: -1 },
      { featureKey: PlanFeatureKey.MAX_SHIPMENTS_PER_MONTH, featureType: PlanFeatureType.NUMBER, featureValue: -1 },
      { featureKey: PlanFeatureKey.CUSTOM_DOMAIN, featureType: PlanFeatureType.BOOLEAN, featureValue: true },
      { featureKey: PlanFeatureKey.API_ACCESS, featureType: PlanFeatureType.BOOLEAN, featureValue: true },
      { featureKey: PlanFeatureKey.SUPPORT_TIER, featureType: PlanFeatureType.STRING, featureValue: 'dedicated' },
      {
        featureKey: PlanFeatureKey.ALLOWED_CARRIERS,
        featureType: PlanFeatureType.LIST,
        featureValue: ['DHL', 'FedEx', 'Aramex', 'UPS', 'EMX'],
      },
      { featureKey: PlanFeatureKey.SSO, featureType: PlanFeatureType.BOOLEAN, featureValue: true },
      { featureKey: PlanFeatureKey.AUDIT_LOGS, featureType: PlanFeatureType.BOOLEAN, featureValue: true },
    ],
  },
];

export const planSeeder = {
  name: '005-plans',
  run: async (): Promise<void> => {
    for (const planData of plans) {
      const existing = await planRepository.findByCode(planData.code);
      if (existing) continue;

      const { features, ...planFields } = planData;

      const plan = planRepository.create(planFields);
      const saved = await planRepository.save(plan);

      const featureEntities = features.map((f) =>
        planFeatureRepository.create({ ...f, planId: saved.id }),
      );
      await planFeatureRepository.save(featureEntities);
    }
  },
};
