import { getQueue } from '../queue.factory';
import { QUEUE_NAMES } from '../../config/queue.config';

export interface ShipmentJobData {
  shipmentId: string;
  carrier: 'ups' | 'fedex' | 'dhl';
}

export const shipmentProducer = {
  async enqueueRateCheck(data: ShipmentJobData) {
    return getQueue(QUEUE_NAMES.SHIPMENT).add('rate-check', data);
  },

  async enqueueCreateLabel(data: ShipmentJobData) {
    return getQueue(QUEUE_NAMES.SHIPMENT).add('create-label', data, { priority: 1 });
  },
};
