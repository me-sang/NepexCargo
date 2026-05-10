import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {}

export const appEvents = new AppEventEmitter();
appEvents.setMaxListeners(50);

export const APP_EVENTS = {
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_STATUS_UPDATED: 'shipment.status.updated',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  USER_REGISTERED: 'user.registered',
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];
