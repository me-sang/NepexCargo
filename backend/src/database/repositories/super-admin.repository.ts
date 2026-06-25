import { AppDataSource } from '../data-source';
import { SuperAdmin } from '../entities';

export const superAdminRepository = AppDataSource.getRepository(SuperAdmin).extend({
  async findByEmail(email: string): Promise<SuperAdmin | null> {
    return this.findOne({ where: { email } });
  },

  async findById(id: string): Promise<SuperAdmin | null> {
    return this.findOne({ where: { id } });
  },
});
