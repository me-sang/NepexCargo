import { AppDataSource } from '../data-source';
import { TenantUsage } from '../entities';

type IncrementableField = Pick<
  TenantUsage,
  'usersCount' | 'customersCount' | 'bookingsCount' | 'shipmentsCount' | 'storageUsedMb'
>;

export const tenantUsageRepository = AppDataSource.getRepository(TenantUsage).extend({
  async findByTenantId(tenantId: string): Promise<TenantUsage | null> {
    return this.findOne({ where: { tenantId } });
  },

  /**
   * Atomically increments a counter column by the given amount.
   * Uses a SQL UPDATE so concurrent requests don't race on a stale read.
   */
  async increment(
    tenantId: string,
    field: keyof IncrementableField,
    amount = 1,
  ): Promise<void> {
    await this.increment({ tenantId }, field, amount);
  },

  async decrement(
    tenantId: string,
    field: keyof IncrementableField,
    amount = 1,
  ): Promise<void> {
    await this.decrement({ tenantId }, field, amount);
  },
});
