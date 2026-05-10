import { AppDataSource } from '../data-source';
import { Role } from '../entities';

export const roleRepository = AppDataSource.getRepository(Role).extend({
  async findWithPermissions(id: string): Promise<Role | null> {
    return this.findOne({
      where: { id },
      relations: ['permissions'],
    });
  },

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({
      where: { name },
      relations: ['permissions'],
    });
  },
});
