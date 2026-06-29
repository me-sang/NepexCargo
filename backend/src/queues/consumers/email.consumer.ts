import { Worker, Job } from 'bullmq';
import { defaultQueueConfig, QUEUE_NAMES } from '@config/queue.config';
import { EmailJobData } from '../producers/email.producer';
import { logger } from '@common/helpers/logger';
import { tenantConfigurationRepository } from '@database/repositories';
import { TenantConfigType, TenantConfigProvider } from '@common/enums/tenant.enums';
import { createEmailClient, EmailService } from '@integrations/email';

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, html, tenantId } = job.data;

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

  const client = createEmailClient({
    provider: config.provider as TenantConfigProvider,
    credentials: config.credentials,
  });

  const emailService = new EmailService(client);

  await emailService.send({
    to,
    subject,
    html,
    fromEmail: creds.fromEmail,
    fromName: creds.fromName,
  });
}

export function startEmailWorker(): Worker {
  const worker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, defaultQueueConfig);
  worker.on('failed', (job, err) => logger.error(`Email job failed: ${job?.id}`, err));
  worker.on('completed', (job) => logger.info(`Email job completed: ${job.id}`));
  return worker;
}
