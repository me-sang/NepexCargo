import { Worker, Job } from 'bullmq';
import { defaultQueueConfig, QUEUE_NAMES } from '@config/queue.config';
import { logger } from '@common/helpers/logger';
import { importZones, importRates } from '@services/rate-import-export.service';
import type { RateImportJobData } from '../producers/rate-import.producer';

async function processRateImportJob(job: Job<RateImportJobData>): Promise<object> {
  const { tenantId, importType, fileBase64, mimetype } = job.data;
  logger.info(`Processing rate-import job`, { jobId: job.id, importType, tenantId });

  const buffer = Buffer.from(fileBase64, 'base64');

  if (importType === 'zones') {
    const result = await importZones(tenantId, buffer, mimetype);
    logger.info(`Zone import completed`, { jobId: job.id, ...result });
    return result;
  }

  const result = await importRates(tenantId, buffer, mimetype);
  logger.info(`Rate import completed`, { jobId: job.id, ...result });
  return result;
}

export function startRateImportWorker(): Worker {
  const worker = new Worker(QUEUE_NAMES.RATE_IMPORT, processRateImportJob, {
    ...defaultQueueConfig,
    concurrency: 2,
  });

  worker.on('failed', (job, err) =>
    logger.error(`rate-import job failed`, { jobId: job?.id, error: err.message }),
  );
  worker.on('completed', (job) =>
    logger.info(`rate-import job completed`, { jobId: job.id }),
  );

  return worker;
}
