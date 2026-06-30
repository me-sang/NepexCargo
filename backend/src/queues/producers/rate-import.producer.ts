import { getQueue } from '../queue.factory';
import { QUEUE_NAMES } from '@config/queue.config';
import { logger } from '@common/helpers/logger';

export type RateImportType = 'zones' | 'rates';

export interface RateImportJobData {
  tenantId: string;
  importType: RateImportType;
  /** File buffer serialised as base64 for Redis storage. */
  fileBase64: string;
  mimetype: string;
}

export const rateImportProducer = {
  async enqueue(data: RateImportJobData): Promise<string> {
    const job = await getQueue(QUEUE_NAMES.RATE_IMPORT).add(data.importType, data, {
      jobId: `${data.tenantId}:${data.importType}:${Date.now()}`,
    });
    logger.info(`Enqueued rate-import job`, { jobId: job.id, importType: data.importType, tenantId: data.tenantId });
    return job.id!;
  },
};
