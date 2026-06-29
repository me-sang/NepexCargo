import { getQueue } from '../queue.factory';
import { QUEUE_NAMES } from '@config/queue.config';
import { logger } from '@common/helpers/logger';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  tenantId: string;
}

export const emailProducer = {
  async send(data: EmailJobData) {
    const job = await getQueue(QUEUE_NAMES.EMAIL).add('send', data);
    logger.info(`A new job "email:send" has been added`, { jobId: job.id, to: data.to });
    return job;
  },
};
