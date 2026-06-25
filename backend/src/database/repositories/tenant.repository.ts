import { AppDataSource } from '../data-source';
import { Tenant } from '../entities';
import { TenantStatus } from '../../common/enums/tenant.enums';

export const tenantRepository = AppDataSource.getRepository(Tenant).extend({
  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.findOne({ where: { slug } });
  },

  async findByCode(code: string): Promise<Tenant | null> {
    return this.findOne({ where: { code } });
  },

  /** Resolves an active tenant by slug — the primary lookup for incoming requests. */
  async findActiveBySlug(slug: string): Promise<Tenant | null> {
    return this.findOne({ where: { slug, status: TenantStatus.ACTIVE } });
  },

  async findWithUsage(id: string): Promise<Tenant | null> {
    return this.findOne({ where: { id }, relations: ['usage'] });
  },

  async findWithConfigurations(id: string): Promise<Tenant | null> {
    return this.findOne({ where: { id }, relations: ['configurations'] });
  },

  async findWithActivePlan(id: string): Promise<Tenant | null> {
    return this.findOne({ where: { id }, relations: ['plans', 'plans.plan'] });
  },
});
