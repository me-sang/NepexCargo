import { getQueue } from '../queue.factory';
import { QUEUE_NAMES } from '@config/queue.config';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  tenantId: string;
}

export const emailProducer = {
  async send(data: EmailJobData) {
    return getQueue(QUEUE_NAMES.EMAIL).add('send', data);
  },
};
