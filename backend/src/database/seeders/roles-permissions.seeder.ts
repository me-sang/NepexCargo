import { roleService, permissionService } from '@services/index';
import { PermissionAction, PermissionResource, UserRole } from '@config/permission.enums';

export const permissionSeeder = {
  name: '001-permissions',
  run: async () => {
    const permissions = [
      {
        name: PermissionResource.SHIPMENT_MANAGEMENT,
        description: 'Manage shipments',
        action: PermissionAction.ALL,
      },
      {
        name: PermissionResource.ORDER_MANAGEMENT,
        description: 'Manage orders',
        action: PermissionAction.READ,
      },
      {
        name: PermissionResource.USER_MANAGEMENT,
        description: 'Manage users',
        action: PermissionAction.ALL,
      },
      {
        name: PermissionResource.PAYMENT_MANAGEMENT,
        description: 'Manage payments',
        action: PermissionAction.READ,
      },
      {
        name: PermissionResource.REPORT_MANAGEMENT,
        description: 'View reports',
        action: PermissionAction.READ,
      },
    ];

    for (const perm of permissions) {
      try {
        await permissionService.createPermission(perm.name, perm.description, perm.action);
      } catch {
        // Already exists
      }
    }
  },
};

export const roleSeeder = {
  name: '002-roles',
  run: async () => {
    const roles = [
      { name: UserRole.ADMIN, description: 'Platform-level administrator within a tenant' },
      { name: UserRole.MANAGER, description: 'Tenant manager with elevated access' },
      { name: UserRole.USER, description: 'Regular tenant staff member' },
      { name: UserRole.PARTNER_OWNER, description: 'Tenant owner with full organisational control' },
      { name: UserRole.AGENT, description: 'Cargo agent with scoped shipment access' },
    ];

    for (const role of roles) {
      try {
        await roleService.createRole(role.name, role.description);
      } catch {
        // Already exists
      }
    }
  },
};
