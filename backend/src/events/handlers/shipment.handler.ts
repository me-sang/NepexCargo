import { appEvents, APP_EVENTS } from '../event-emitter';
import { emailProducer } from '../../queues/producers/email.producer';
import { logger } from '../../common/helpers/logger';

export function registerShipmentHandlers(): void {
  appEvents.on(
    APP_EVENTS.SHIPMENT_CREATED,
    async (payload: { shipmentId: string; email: string }) => {
      logger.info(`Shipment created: ${payload.shipmentId}`);
      await emailProducer.send({
        to: payload.email,
        templateId: 'shipment-confirmation',
        variables: { shipmentId: payload.shipmentId },
      });
    },
  );

  appEvents.on(
    APP_EVENTS.SHIPMENT_STATUS_UPDATED,
    (payload: { shipmentId: string; status: string }) => {
      logger.info(`Shipment ${payload.shipmentId} updated to ${payload.status}`);
    },
  );
}
