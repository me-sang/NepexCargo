import { TenantConfigProvider } from '@common/enums/tenant.enums';

export interface EmailConfig {
  provider: TenantConfigProvider;
  credentials: Record<string, unknown>;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  fromEmail: string;
  fromName: string;
}
