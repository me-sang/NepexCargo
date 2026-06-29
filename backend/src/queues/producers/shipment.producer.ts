import { getQueue } from '../queue.factory';
import { QUEUE_NAMES } from '../../config/queue.config';
import { logger } from '../../common/helpers/logger';

export interface ShipmentJobData {
  shipmentId: string;
  carrier: 'ups' | 'fedex' | 'dhl';
}

export const shipmentProducer = {
  async enqueueRateCheck(data: ShipmentJobData) {
    const job = await getQueue(QUEUE_NAMES.SHIPMENT).add('rate-check', data);
    logger.info(`A new job "shipment:rate-check" has been added`, { jobId: job.id, shipmentId: data.shipmentId });
    return job;
  },

  async enqueueCreateLabel(data: ShipmentJobData) {
    const job = await getQueue(QUEUE_NAMES.SHIPMENT).add('create-label', data, { priority: 1 });
    logger.info(`A new job "shipment:create-label" has been added`, { jobId: job.id, shipmentId: data.shipmentId });
    return job;
  },
};
