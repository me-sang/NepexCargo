/**
 * Structured (common) config shapes the normalizer accepts as INPUT.
 *
 * Callers assemble these from `env`, the database, or a tenant config and hand
 * them to the normalizer, which maps them into a provider's integration-specific
 * config (e.g. `EmxClientConfig`). Fields are optional because each provider only
 * consumes the subset it needs.
 */

/** Common config for shipment providers (EMX, FedEx, DHL). */
export interface StructuredShipmentConfig {
  /** EMX `x-api-key`, DHL `DHL-API-Key`, FedEx `client_id`. */
  apiKey?: string;
  /** FedEx `client_secret`. */
  apiSecret?: string;
  /** EMX `AccountNo`, FedEx billing account number. */
  accountNumber?: string;
  /** EMX `Password`. */
  password?: string;
  /** Explicit primary host (EMX). When omitted, `sandbox` selects the host. */
  baseUrl?: string;
  /** EMX tracking host. */
  trackingBaseUrl?: string;
  /** Selects sandbox vs production host for providers with fixed hosts (DHL, FedEx). */
  sandbox?: boolean;
}

/** Common config for payment providers (Stripe). */
export interface StructuredPaymentConfig {
  secretKey?: string;
  apiVersion?: string;
  webhookSecret?: string;
}
