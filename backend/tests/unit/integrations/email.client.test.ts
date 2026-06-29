import { createEmailClient, ResendEmailClient, SmtpEmailClient } from '@integrations/email';
import { EmailService } from '@integrations/email';
import { TenantConfigProvider } from '@common/enums/tenant.enums';

describe('createEmailClient', () => {
  it('returns ResendEmailClient for RESEND provider', () => {
    const client = createEmailClient({
      provider: TenantConfigProvider.RESEND,
      credentials: { apiKey: 're_test_key', fromEmail: 'n@e.com', fromName: 'App' },
    });
    expect(client).toBeInstanceOf(ResendEmailClient);
  });

  it('returns SmtpEmailClient for SMTP provider', () => {
    const client = createEmailClient({
      provider: TenantConfigProvider.SMTP,
      credentials: { host: 'smtp.test.com', port: 587, secure: false, user: 'u', password: 'p', fromEmail: 'n@e.com', fromName: 'App' },
    });
    expect(client).toBeInstanceOf(SmtpEmailClient);
  });

  it('throws for unsupported provider', () => {
    expect(() =>
      createEmailClient({ provider: 'unknown' as TenantConfigProvider, credentials: {} }),
    ).toThrow('Unsupported email provider: unknown');
  });
});

describe('EmailService.send', () => {
  it('delegates to client.send with the full message', async () => {
    const mockClient = { send: jest.fn().mockResolvedValue(undefined) };
    const service = new EmailService(mockClient);

    const msg = {
      to: 'user@test.com',
      subject: 'Test',
      html: '<p>hi</p>',
      fromEmail: 'no-reply@app.com',
      fromName: 'App',
    };
    await service.send(msg);

    expect(mockClient.send).toHaveBeenCalledTimes(1);
    expect(mockClient.send).toHaveBeenCalledWith(msg);
  });
});
