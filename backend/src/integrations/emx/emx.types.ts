/* eslint-disable @typescript-eslint/naming-convention -- EMX response fields
   (AWBNumber, ErrorMsg, ShipperCity, …) must mirror the API's PascalCase wire
   format; renaming them would break (de)serialization. */
/**
 * Type definitions for the EMX (Emirates Post) shipping API.
 *
 * Derived from the "Emirates Post APIs Integration" Postman collection. The
 * collection exposes four endpoints:
 *   - POST /api/Shipments/create   → {@link EmxCreateShipmentRequest} / {@link EmxCreateShipmentResponse}
 *   - POST /api/Shipments/cancel   → {@link EmxCancelShipmentResponse}
 *   - GET  /api/label/print        → {@link EmxPrintLabelResponse}
 *   - GET  /api/Tracking           → {@link EmxTrackingResponse}
 *
 * NOTE ON RESPONSE SHAPES: only the create-shipment response body is real in the
 * collection — the saved examples for track/print/cancel are duplicates of the
 * create example. Those response interfaces are therefore best-effort and flagged
 * `@unconfirmed`; verify them against the live EMX responses or official docs.
 */

import {
  EmxContentType,
  EmxCurrency,
  EmxDeliveryType,
  EmxDimensionUnit,
  EmxPrintType,
  EmxProductCode,
  EmxServiceType,
  EmxWeightUnit,
} from './emx.enums';

// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

/**
 * Integration-specific config consumed by {@link EmxClient}. Produced by the
 * shipment normalizer from a structured/common config — the client never reads
 * `env` itself.
 */
export interface EmxClientConfig {
  /** Shipments + label host (Create / Cancel / Print). Authenticated with x-api-key. */
  baseUrl: string;
  /** Tracking host. Authenticated with AccountNo. */
  trackingBaseUrl: string;
  apiKey: string;
  accountNo: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Shared / primitive structures
// ---------------------------------------------------------------------------

/** A nullable string — EMX returns explicit `null` for many optional fields. */
export type EmxNullableString = string | null;

/** Monetary amount with an ISO currency. `currency` may be null in COD payloads. */
export interface EmxMoney {
  amount: number;
  currency: EmxCurrency | null;
}

/** Package weight. */
export interface EmxWeight {
  value: number;
  unit: EmxWeightUnit;
}

/** Package dimensions. */
export interface EmxDimensions {
  length: number;
  height: number;
  width: number;
  unit: EmxDimensionUnit;
}

/** Geo coordinates. EMX accepts null or empty-string values when unknown. */
export interface EmxGeoPoint {
  latitude: number | string | null;
  longitude: number | string | null;
}

/** Contact details for a shipper or consignee. */
export interface EmxContact {
  name: string;
  mobileNumber: string;
  phoneNumber: string;
  emailAddress: string;
  companyName: string;
}

/** Postal address for a shipper or consignee. */
export interface EmxAddress {
  line1: string;
  regionCode: EmxNullableString;
  city: string;
  cityCode: EmxNullableString;
  state: EmxNullableString;
  countryCode: string;
  zipCode: string;
  point: EmxGeoPoint;
  countryName: string;
}

/** A shipment party (shipper or consignee). */
export interface EmxParty {
  contact: EmxContact;
  address: EmxAddress;
  referenceNo1: string;
  referenceNo2: string;
}

/** EMX account the shipment is billed to. */
export interface EmxAccount {
  number: number;
}

/**
 * Customs declaration line item for international shipments.
 *
 * @unconfirmed The collection only ever sends an empty `customsDeclarations`
 * array, so the exact field names are not known. These are sensible defaults —
 * verify against the EMX customs schema before sending real declarations.
 */
export interface EmxCustomsDeclaration {
  description?: string;
  quantity?: number;
  value?: number;
  currency?: EmxCurrency | string;
  countryOfOrigin?: string;
  hsCode?: string;
  weight?: EmxWeight;
}

/**
 * Common result envelope returned inside every EMX response.
 * `ErrorMsg` is a colon-delimited string (e.g. `" :  :  : "`) when there is no error.
 */
export interface EmxServiceResult {
  success: boolean;
  ErrorMsg: string;
}

// ---------------------------------------------------------------------------
// Create Shipment — POST /api/Shipments/create
// ---------------------------------------------------------------------------

export interface EmxCreateShipmentRequest {
  weight: EmxWeight;
  shipper: EmxParty;
  consignee: EmxParty;
  dimensions: EmxDimensions;
  account: EmxAccount;
  productCode: EmxProductCode;
  serviceType: EmxServiceType;
  printType: EmxPrintType;
  sendMailToSender: boolean;
  sendMailToReceiver: boolean;
  isInsured: boolean;
  customsDeclarations: EmxCustomsDeclaration[];
  declaredValue: EmxMoney;
  numberOfPieces: number;
  referenceNumber1: string;
  referenceNumber2: string;
  referenceNumber3: string;
  referenceNumber4: string;
  specialNotes: string;
  remarks: string;
  branchName: EmxNullableString;
  deliveryType: EmxDeliveryType;
  contentType: EmxContentType;
  isCod: boolean;
  /** Cash-on-delivery amount. Sent even when `isCod` is false (amount 0). */
  coDAmount: EmxMoney;
}

/** The `BookingResponse` object inside a create-shipment response. */
export interface EmxBookingResponse {
  AWBNumber: string;
  Status: EmxNullableString;
  Description: EmxNullableString;
  AWBLabelURL: EmxNullableString;
  /** Base64-encoded PDF of the air-waybill label. */
  AWBLabel: EmxNullableString;
  ShipperContactName: EmxNullableString;
  ShipperCompanyName: EmxNullableString;
  ShipperCity: EmxNullableString;
  ShipperCountry: EmxNullableString;
  ReceiverContactName: EmxNullableString;
  ReceiverCompanyName: EmxNullableString;
  ReceiverCity: EmxNullableString;
  ReceiverCountry: EmxNullableString;
  ProductGroup: EmxNullableString;
  PaymentType: EmxNullableString;
  CODAmount: number | null;
  CODCurrency: EmxNullableString;
  ReferenceNo: EmxNullableString;
  serviceResult: EmxServiceResult;
}

export interface EmxCreateShipmentResponse {
  BookingResponse: EmxBookingResponse;
}

// ---------------------------------------------------------------------------
// Cancel Shipment — POST /api/Shipments/cancel?awb=...
// ---------------------------------------------------------------------------

/**
 * @unconfirmed Cancel returns no real example in the collection. EMX wraps
 * results in {@link EmxServiceResult}; the surrounding shape is a best guess.
 */
export interface EmxCancelShipmentResponse {
  awb?: string;
  serviceResult?: EmxServiceResult;
}

// ---------------------------------------------------------------------------
// Print Label — GET /api/label/print?awb=...
// ---------------------------------------------------------------------------

/**
 * @unconfirmed The print endpoint most likely returns the label as a
 * base64-encoded PDF (mirroring `BookingResponse.AWBLabel`) or as a raw binary
 * stream. Modelled here as the base64 envelope; confirm against the live API.
 */
export interface EmxPrintLabelResponse {
  awb?: string;
  /** Base64-encoded PDF of the air-waybill label. */
  AWBLabel?: EmxNullableString;
  AWBLabelURL?: EmxNullableString;
  serviceResult?: EmxServiceResult;
}

// ---------------------------------------------------------------------------
// Track Shipment — GET /api/Tracking?awbNumber=...
// ---------------------------------------------------------------------------

/**
 * A single tracking checkpoint.
 *
 * @unconfirmed Field names are inferred from typical EMX tracking payloads.
 */
export interface EmxTrackingEvent {
  status?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
}

/**
 * @unconfirmed The tracking response example in the collection is a placeholder
 * (a copy of the create-shipment example). Verify this shape against the live
 * `GET /api/Tracking` response.
 */
export interface EmxTrackingResponse {
  awbNumber?: string;
  status?: EmxNullableString;
  events?: EmxTrackingEvent[];
  serviceResult?: EmxServiceResult;
}
