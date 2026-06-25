/** Lifecycle state of a tenant account. */
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/** Billing model used for the tenant account. */
export enum TenantAccountType {
  /** Prepaid — charges drawn from wallet balance. */
  REGULAR = 'regular',
  /** Postpaid — charges accumulate up to a credit limit. */
  CREDIT = 'credit',
}

/** Lifecycle state of a tenant's plan subscription. */
export enum TenantPlanStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

/** How the subscription renews after each billing cycle. */
export enum TenantPlanRenewalType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

/** Logical grouping for tenant settings keys. */
export enum TenantSettingCategory {
  BRANDING = 'branding',
  PAYMENT = 'payment',
  SHIPMENT = 'shipment',
  NOTIFICATIONS = 'notifications',
  OTHER = 'other',
}

/** Whether a domain was assigned as a subdomain or a custom domain brought by the tenant. */
export enum TenantDomainType {
  SUBDOMAIN = 'subdomain',
  CUSTOM = 'custom',
}

/** SSL provisioning state for a tenant domain. */
export enum TenantDomainSslStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/** Category of external service a tenant configuration entry covers. */
export enum TenantConfigType {
  PAYMENT = 'payment',
  SHIPMENT = 'shipment',
  EMAIL = 'email',
  SMS = 'sms',
  OTHER = 'other',
}

/** External provider identifiers used in tenant configurations. */
export enum TenantConfigProvider {
  // Shipment
  DHL = 'DHL',
  FEDEX = 'FedEx',
  ARAMEX = 'Aramex',
  UPS = 'UPS',
  EMX = 'EMX',
  // Payment
  STRIPE = 'Stripe',
  PAYPAL = 'PayPal',
  // Email
  SENDGRID = 'SendGrid',
  MAILGUN = 'Mailgun',
  // SMS
  TWILIO = 'Twilio',
}
