import { Worker, Job } from 'bullmq';
import { defaultQueueConfig, QUEUE_NAMES } from '@config/queue.config';
import { EmailJobData } from '../producers/email.producer';
import { logger } from '@common/helpers/logger';
import { tenantConfigurationRepository } from '@database/repositories';
import { TenantConfigType, TenantConfigProvider } from '@common/enums/tenant.enums';
import { createEmailClient, EmailService } from '@integrations/email';
import { env } from '@config/env.config';

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, html, tenantId } = job.data;

  let fromEmail: string;
  let fromName: string;
  let client: ReturnType<typeof createEmailClient>;

  if (env.SOURCE_EMAIL === 'env') {
    logger.info(`Using default email configuration from environment variables`);
    // Temporary fallback: use Resend key from environment variables
    fromEmail = env.RESEND_FROM_EMAIL;
    fromName = env.RESEND_FROM_NAME;
    client = createEmailClient({
      provider: TenantConfigProvider.RESEND,
      credentials: { apiKey: env.RESEND_API_KEY, fromEmail, fromName },
    });
  } else {
    const configs = await tenantConfigurationRepository.findEnabledByType(
      tenantId,
      TenantConfigType.EMAIL,
    );

    if (!configs.length) {
      logger.error(`No email configuration found for tenant ${tenantId}`);
      throw new Error(`No email configuration for tenant ${tenantId}`);
    }

    const [config] = configs;
    const creds = config.credentials as { fromEmail: string; fromName: string };
    fromEmail = creds.fromEmail;
    fromName = creds.fromName;
    client = createEmailClient({
      provider: config.provider,
      credentials: config.credentials,
    });
  }

  await new EmailService(client).send({ to, subject, html, fromEmail, fromName });
}

export function startEmailWorker(): Worker {
  const worker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, defaultQueueConfig);
  worker.on('failed', (job, err) => logger.error(`Email job failed: ${job?.id}`, err));
  worker.on('completed', (job) => logger.info(`Email job completed: ${job.id}`));
  return worker;
}
