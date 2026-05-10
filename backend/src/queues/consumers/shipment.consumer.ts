import { Worker, Job } from 'bullmq';
import { defaultQueueConfig, QUEUE_NAMES } from '../../config/queue.config';
import { ShipmentJobData } from '../producers/shipment.producer';
import { logger } from '../../common/helpers/logger';

async function processShipmentJob(job: Job<ShipmentJobData>): Promise<void> {
  logger.info(`Processing shipment job: ${job.name}`, { id: job.id, data: job.data });

  switch (job.name) {
    case 'rate-check':
      // handle rate check
      break;
    case 'create-label':
      // handle label creation
      break;
    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
}

export function startShipmentWorker(): Worker {
  const worker = new Worker(QUEUE_NAMES.SHIPMENT, processShipmentJob, defaultQueueConfig);
  worker.on('failed', (job, err) => logger.error(`Shipment job failed: ${job?.id}`, err));
  worker.on('completed', (job) => logger.info(`Shipment job completed: ${job.id}`));
  return worker;
}
