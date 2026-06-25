import { AppDataSource } from '../data-source';
import { PlanFeature } from '../entities';

export const planFeatureRepository = AppDataSource.getRepository(PlanFeature).extend({
  async findByPlanId(planId: string): Promise<PlanFeature[]> {
    return this.find({ where: { planId } });
  },

  /** Single feature lookup — used by limit-check logic at runtime. */
  async findByPlanAndKey(planId: string, featureKey: string): Promise<PlanFeature | null> {
    return this.findOne({ where: { planId, featureKey } });
  },
});
