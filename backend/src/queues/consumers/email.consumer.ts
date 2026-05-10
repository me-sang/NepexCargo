import { Worker, Job } from 'bullmq';
import { defaultQueueConfig, QUEUE_NAMES } from '../../config/queue.config';
import { EmailJobData } from '../producers/email.producer';
import { logger } from '../../common/helpers/logger';

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  logger.info(`Sending email to ${job.data.to}`, { template: job.data.templateId });
  // integrate email provider here (e.g. Resend, SendGrid)
}

export function startEmailWorker(): Worker {
  const worker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, defaultQueueConfig);
  worker.on('failed', (job, err) => logger.error(`Email job failed: ${job?.id}`, err));
  worker.on('completed', (job) => logger.info(`Email job completed: ${job.id}`));
  return worker;
}
