import { appEvents, APP_EVENTS } from '../event-emitter';
import { emailProducer } from '../../queues/producers/email.producer';
import { logger } from '../../common/helpers/logger';

export function registerShipmentHandlers(): void {
  appEvents.on(
    APP_EVENTS.SHIPMENT_CREATED,
    async (payload: { shipmentId: string; email: string; tenantId: string }) => {
      logger.info(`Shipment created: ${payload.shipmentId}`);
      await emailProducer.send({
        to: payload.email,
        subject: 'Shipment Confirmation',
        html: `<p>Your shipment <strong>${payload.shipmentId}</strong> has been created successfully.</p>`,
        tenantId: payload.tenantId,
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
