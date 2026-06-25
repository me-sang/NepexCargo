import { AppDataSource } from '../data-source';
import { TenantDomain } from '../entities';

export const tenantDomainRepository = AppDataSource.getRepository(TenantDomain).extend({
  /** Used by the request router to resolve which tenant owns an incoming domain. */
  async findByDomain(domain: string): Promise<TenantDomain | null> {
    return this.findOne({ where: { domain }, relations: ['tenant'] });
  },

  async findPrimary(tenantId: string): Promise<TenantDomain | null> {
    return this.findOne({ where: { tenantId, isPrimary: true } });
  },

  async findAllByTenant(tenantId: string): Promise<TenantDomain[]> {
    return this.find({ where: { tenantId }, order: { isPrimary: 'DESC', createdAt: 'ASC' } });
  },

  async findByVerificationToken(token: string): Promise<TenantDomain | null> {
    return this.findOne({ where: { verificationToken: token } });
  },
});
