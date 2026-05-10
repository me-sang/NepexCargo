export { appEvents, APP_EVENTS } from './event-emitter';
export { registerShipmentHandlers } from './handlers/shipment.handler';

export function registerAllHandlers(): void {
  const { registerShipmentHandlers } = require('./handlers/shipment.handler');
  registerShipmentHandlers();
}
