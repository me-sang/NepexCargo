export enum USER_ROLE {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

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
