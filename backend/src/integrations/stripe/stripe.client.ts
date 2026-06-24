// eslint-disable-next-line @typescript-eslint/naming-convention -- SDK default export
import Stripe from 'stripe';

/**
 * Integration-specific config consumed by {@link StripeClient}. Produced by the
 * payment normalizer — the client does not read `env`.
 */
export interface StripeClientConfig {
  secretKey: string;
  apiVersion: string;
  webhookSecret: string;
}

/**
 * Thin wrapper around the official Stripe SDK. Exposes the configured `sdk`
 * instance and the `webhookSecret` so {@link StripeService} stays env-agnostic.
 */
export class StripeClient {
  readonly sdk: Stripe;
  readonly webhookSecret: string;

  constructor(config: StripeClientConfig) {
    this.sdk = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion as Stripe.LatestApiVersion,
      typescript: true,
    });
    this.webhookSecret = config.webhookSecret;
  }
}
