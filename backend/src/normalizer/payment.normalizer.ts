import { ClientName } from '../common/enums/client.enums';
import { StripeClientConfig } from '../integrations/stripe/stripe.client';
import { StructuredPaymentConfig } from './normalizer.types';

/** Union of the integration-specific configs the payment normalizer can return. */
export type PaymentClientConfig = StripeClientConfig;

/** Default Stripe API version used when the structured config omits one. */
const DEFAULT_STRIPE_API_VERSION = '2025-04-30.basil';

const required = (value: string | undefined, name: ClientName, field: string): string => {
  if (value === undefined || value === '') {
    throw new Error(`Missing "${field}" in structured config for ${name} payment client`);
  }
  return value;
};

/**
 * Map a structured payment config to a provider's integration-specific config.
 *
 * @throws if `name` is not a payment provider or a required field is missing.
 */
export function normalizePaymentConfig(
  config: StructuredPaymentConfig,
  name: ClientName,
): PaymentClientConfig {
  switch (name) {
    case ClientName.STRIPE:
      return {
        secretKey: required(config.secretKey, name, 'secretKey'),
        apiVersion: config.apiVersion ?? DEFAULT_STRIPE_API_VERSION,
        webhookSecret: required(config.webhookSecret, name, 'webhookSecret'),
      };

    default:
      throw new Error(`${name} is not a payment client`);
  }
}
