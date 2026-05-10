import { permissionRepository } from '@database/repositories';
import { Permission } from '@database/entities';

export class PermissionService {
  async createPermission(name: string, description: string, action: string): Promise<Permission> {
    const existing = await permissionRepository.findOne({ where: { name } });
    if (existing) {
      throw new Error(`Permission '${name}' already exists`);
    }

    const permission = permissionRepository.create({ name, description, category: action });
    return permissionRepository.save(permission);
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return permissionRepository.findOne({ where: { name } });
  }
}

export const permissionService = new PermissionService();
