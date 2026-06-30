export enum UserRole {
  /** Platform-level administrator within a tenant. */
  ADMIN = 'admin',
  /** Tenant manager — elevated access within an organisation. */
  MANAGER = 'manager',
  /** Regular tenant staff member. */
  USER = 'user',
  /** Tenant owner — created on onboarding, has full tenant control. */
  PARTNER_OWNER = 'partner_owner',
  /** Tenant agent — cargo agent with scoped shipment access. */
  AGENT = 'agent',
}

/** @deprecated Use UserRole */
export const USER_ROLE = UserRole;

export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  UPDATE = 'update',
  ALL = 'all',
}

export enum PermissionResource {
  SHIPMENT_MANAGEMENT = 'shipment_management',
  ORDER_MANAGEMENT = 'order_management',
  USER_MANAGEMENT = 'user_management',
  PAYMENT_MANAGEMENT = 'payment_management',
  REPORT_MANAGEMENT = 'report_management',
}
