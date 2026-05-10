import { roleRepository, permissionRepository } from '@database/repositories';
import { Role } from '@database/entities';

export class RoleService {
  async createRole(name: string, description: string): Promise<Role> {
    const existing = await roleRepository.findOne({ where: { name } });
    if (existing) {
      throw new Error(`Role '${name}' already exists`);
    }

    const role = roleRepository.create({ name, description });
    return roleRepository.save(role);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }
}

export const roleService = new RoleService();
