import { AppDataSource } from '../data-source';
import { Agent } from '../entities/agent.entity';

export const agentRepository = AppDataSource.getRepository(Agent).extend({
  async findByTenant(tenantId: string): Promise<Agent[]> {
    return this.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  },

  async findByTenantAndId(tenantId: string, id: string): Promise<Agent | null> {
    return this.findOne({ where: { id, tenantId }, relations: ['user'] });
  },
});
