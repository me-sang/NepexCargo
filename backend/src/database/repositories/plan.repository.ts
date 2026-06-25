import { AppDataSource } from '../data-source';
import { Plan } from '../entities';

export const planRepository = AppDataSource.getRepository(Plan).extend({
  async findByCode(code: string): Promise<Plan | null> {
    return this.findOne({ where: { code } });
  },

  /** Returns all publicly listed, active plans ordered for the pricing page. */
  async findAllPublicActive(): Promise<Plan[]> {
    return this.find({
      where: { isPublic: true, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  },

  async findWithFeatures(id: string): Promise<Plan | null> {
    return this.findOne({ where: { id }, relations: ['features'] });
  },

  async findByCodeWithFeatures(code: string): Promise<Plan | null> {
    return this.findOne({ where: { code }, relations: ['features'] });
  },
});
