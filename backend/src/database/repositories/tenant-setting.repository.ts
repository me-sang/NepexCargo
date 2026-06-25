import { AppDataSource } from '../data-source';
import { TenantSetting } from '../entities';
import { TenantSettingCategory } from '../../common/enums/tenant.enums';

export const tenantSettingRepository = AppDataSource.getRepository(TenantSetting).extend({
  async findByCategory(tenantId: string, category: TenantSettingCategory): Promise<TenantSetting[]> {
    return this.find({ where: { tenantId, category } });
  },

  async findByKey(
    tenantId: string,
    category: TenantSettingCategory,
    key: string,
  ): Promise<TenantSetting | null> {
    return this.findOne({ where: { tenantId, category, key } });
  },

  async findAllByTenant(tenantId: string): Promise<TenantSetting[]> {
    return this.find({ where: { tenantId }, order: { category: 'ASC', key: 'ASC' } });
  },
});
