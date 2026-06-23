/**
 * Identity enums for third-party integration clients.
 *
 * `ClientName` is the provider; `ClientType` is the domain it serves. The
 * normalizer (`src/normalizer`) uses both to map structured/common config into
 * a given provider's integration-specific config shape.
 */

/** Provider a client talks to. */
export enum ClientName {
  EMX = 'EMX',
  FEDEX = 'FEDEX',
  DHL = 'DHL',
  STRIPE = 'STRIPE',
}

/** Domain a client serves. */
export enum ClientType {
  SHIPMENT = 'SHIPMENT',
  PAYMENT = 'PAYMENT',
}
