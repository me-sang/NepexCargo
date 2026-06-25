import { AppDataSource } from '../data-source';
import { TenantPlan } from '../entities';
import { TenantPlanStatus } from '../../common/enums/tenant.enums';

export const tenantPlanRepository = AppDataSource.getRepository(TenantPlan).extend({
  /** Returns the current active or trial subscription for a tenant. */
  async findActivePlan(tenantId: string): Promise<TenantPlan | null> {
    return this.findOne({
      where: [
        { tenantId, status: TenantPlanStatus.ACTIVE },
        { tenantId, status: TenantPlanStatus.TRIAL },
      ],
      relations: ['plan', 'plan.features'],
      order: { createdAt: 'DESC' },
    });
  },

  /** Full subscription history for a tenant, newest first. */
  async findAllByTenant(tenantId: string): Promise<TenantPlan[]> {
    return this.find({
      where: { tenantId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  },

  async findById(id: string): Promise<TenantPlan | null> {
    return this.findOne({ where: { id }, relations: ['plan', 'tenant'] });
  },
});
