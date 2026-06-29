import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { TenantConfigProvider } from '@common/enums/tenant.enums';
import { EmailConfig, EmailMessage } from './email.types';

export interface EmailClient {
  send(message: EmailMessage): Promise<void>;
}

export class ResendEmailClient implements EmailClient {
  private readonly sdk: Resend;

  constructor(config: EmailConfig) {
    const creds = config.credentials as { apiKey: string };
    this.sdk = new Resend(creds.apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.sdk.emails.send({
      from: `${message.fromName} <${message.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }
  }
}

export class SmtpEmailClient implements EmailClient {
  constructor(private readonly config: EmailConfig) {}

  async send(message: EmailMessage): Promise<void> {
    const creds = this.config.credentials as {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };

    const transporter = nodemailer.createTransport({
      host: creds.host,
      port: creds.port,
      secure: creds.secure,
      auth: { user: creds.user, pass: creds.password },
    });

    await transporter.sendMail({
      from: `"${message.fromName}" <${message.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }
}

export function createEmailClient(config: EmailConfig): EmailClient {
  switch (config.provider) {
    case TenantConfigProvider.RESEND:
      return new ResendEmailClient(config);
    case TenantConfigProvider.SMTP:
      return new SmtpEmailClient(config);
    default:
      throw new Error(`Unsupported email provider: ${config.provider}`);
  }
}
