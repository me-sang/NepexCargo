import { AppDataSource } from '../data-source';
import { Permission } from '../entities';

export const permissionRepository = AppDataSource.getRepository(Permission).extend({
  async findByName(name: string): Promise<Permission | null> {
    return this.findOne({ where: { name } });
  },

  async findByCategory(category: string): Promise<Permission[]> {
    return this.find({ where: { category } });
  },
});
