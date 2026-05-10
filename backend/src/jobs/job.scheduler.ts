import { Queue } from 'bullmq';
import { getQueue } from '../queues/queue.factory';
import { QUEUE_NAMES } from '../config/queue.config';
import { logger } from '../common/helpers/logger';

async function registerRepeatableJobs(queue: Queue, jobs: Array<{ name: string; cron: string; data: unknown }>) {
  for (const job of jobs) {
    await queue.add(job.name, job.data, { repeat: { pattern: job.cron } });
    logger.info(`Registered repeatable job: ${job.name} [${job.cron}]`);
  }
}

export async function startScheduledJobs(): Promise<void> {
  const shipmentQueue = getQueue(QUEUE_NAMES.SHIPMENT);

  await registerRepeatableJobs(shipmentQueue, [
    { name: 'daily-rate-sync', cron: '0 6 * * *', data: {} },
  ]);
}
