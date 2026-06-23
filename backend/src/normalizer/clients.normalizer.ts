import { ClientName, ClientType } from '../common/enums/client.enums';
import { normalizePaymentConfig, PaymentClientConfig } from './payment.normalizer';
import { normalizeShipmentConfig, ShipmentClientConfig } from './shipment.normalizer';
import { StructuredPaymentConfig, StructuredShipmentConfig } from './normalizer.types';

/**
 * Entry point for config normalization. Routes a structured/common config to the
 * shipment or payment normalizer based on `type`, returning the provider's
 * integration-specific config — ready to pass into that client's constructor.
 *
 * @example
 *   const cfg = normalizeClientConfig(structured, ClientName.EMX, ClientType.SHIPMENT);
 *   const client = new EmxClient(cfg);
 *   const service = new EmxService(client);
 */
export function normalizeClientConfig(
  config: StructuredShipmentConfig,
  name: ClientName,
  type: ClientType.SHIPMENT,
): ShipmentClientConfig;
export function normalizeClientConfig(
  config: StructuredPaymentConfig,
  name: ClientName,
  type: ClientType.PAYMENT,
): PaymentClientConfig;
export function normalizeClientConfig(
  config: StructuredShipmentConfig | StructuredPaymentConfig,
  name: ClientName,
  type: ClientType,
): ShipmentClientConfig | PaymentClientConfig {
  switch (type) {
    case ClientType.SHIPMENT:
      return normalizeShipmentConfig(config as StructuredShipmentConfig, name);
    case ClientType.PAYMENT:
      return normalizePaymentConfig(config as StructuredPaymentConfig, name);
    default:
      throw new Error(`Unsupported client type: ${String(type)}`);
  }
}
