import { AppDataSource } from '../data-source';
import { User } from '../entities';

export const userRepository = AppDataSource.getRepository(User).extend({
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  },

  async findWithPermissions(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  },
});
