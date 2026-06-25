import { AppDataSource } from '../data-source';
import { TenantConfiguration } from '../entities';
import { TenantConfigProvider, TenantConfigType } from '../../common/enums/tenant.enums';

export const tenantConfigurationRepository = AppDataSource.getRepository(TenantConfiguration).extend({
  async findAllByTenant(tenantId: string): Promise<TenantConfiguration[]> {
    return this.find({ where: { tenantId }, order: { configType: 'ASC', priority: 'ASC' } });
  },

  /** All configurations of a given type, e.g. all shipment providers for a tenant. */
  async findByType(tenantId: string, configType: TenantConfigType): Promise<TenantConfiguration[]> {
    return this.find({
      where: { tenantId, configType },
      order: { priority: 'ASC' },
    });
  },

  async findByTypeAndProvider(
    tenantId: string,
    configType: TenantConfigType,
    provider: TenantConfigProvider,
  ): Promise<TenantConfiguration | null> {
    return this.findOne({ where: { tenantId, configType, provider } });
  },

  /**
   * Enabled configurations of a type sorted by priority.
   * Used at shipment/payment time to pick the right active provider.
   */
  async findEnabledByType(
    tenantId: string,
    configType: TenantConfigType,
  ): Promise<TenantConfiguration[]> {
    return this.find({
      where: { tenantId, configType, enabled: true },
      order: { priority: 'ASC' },
    });
  },
});
