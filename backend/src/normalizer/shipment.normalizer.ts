import { ClientName } from '../common/enums/client.enums';
import { DhlClientConfig } from '../integrations/dhl/dhl.client';
import { EmxClientConfig } from '../integrations/emx/emx.types';
import { FedexClientConfig } from '../integrations/fedex/fedex.client';
import { StructuredShipmentConfig } from './normalizer.types';

/** Union of the integration-specific configs the shipment normalizer can return. */
export type ShipmentClientConfig = EmxClientConfig | DhlClientConfig | FedexClientConfig;

/** Maps a shipment provider name to its specific config, so callers get an exact type. */
export type ShipmentConfigFor<N extends ClientName> = N extends ClientName.EMX
  ? EmxClientConfig
  : N extends ClientName.DHL
    ? DhlClientConfig
    : N extends ClientName.FEDEX
      ? FedexClientConfig
      : never;

/** Fixed sandbox/production hosts for providers that don't take an explicit base URL. */
const DHL_HOSTS = {
  sandbox: 'https://api-mock.dhl.com',
  production: 'https://api.dhl.com',
} as const;

const FEDEX_HOSTS = {
  sandbox: 'https://apis-sandbox.fedex.com',
  production: 'https://apis.fedex.com',
} as const;

const required = (value: string | undefined, name: ClientName, field: string): string => {
  if (value === undefined || value === '') {
    throw new Error(`Missing "${field}" in structured config for ${name} shipment client`);
  }
  return value;
};

const resolveHost = (
  explicit: string | undefined,
  sandbox: boolean | undefined,
  hosts: { sandbox: string; production: string },
): string => explicit ?? (sandbox === false ? hosts.production : hosts.sandbox);

/**
 * Map a structured shipment config to a provider's integration-specific config.
 * The return type narrows to the given provider's config (e.g. `EmxClientConfig`).
 *
 * @throws if `name` is not a shipment provider or a required field is missing.
 */
export function normalizeShipmentConfig<N extends ClientName>(
  config: StructuredShipmentConfig,
  name: N,
): ShipmentConfigFor<N>;
export function normalizeShipmentConfig(
  config: StructuredShipmentConfig,
  name: ClientName,
): ShipmentClientConfig {
  switch (name) {
    case ClientName.EMX:
      return {
        baseUrl: required(config.baseUrl, name, 'baseUrl'),
        trackingBaseUrl: required(config.trackingBaseUrl, name, 'trackingBaseUrl'),
        apiKey: required(config.apiKey, name, 'apiKey'),
        accountNo: required(config.accountNumber, name, 'accountNumber'),
        password: required(config.password, name, 'password'),
      };

    case ClientName.DHL:
      return {
        baseUrl: resolveHost(config.baseUrl, config.sandbox, DHL_HOSTS),
        apiKey: required(config.apiKey, name, 'apiKey'),
      };

    case ClientName.FEDEX:
      return {
        baseUrl: resolveHost(config.baseUrl, config.sandbox, FEDEX_HOSTS),
        clientId: required(config.apiKey, name, 'apiKey'),
        clientSecret: required(config.apiSecret, name, 'apiSecret'),
        accountNumber: required(config.accountNumber, name, 'accountNumber'),
      };

    default:
      throw new Error(`${name} is not a shipment client`);
  }
}
