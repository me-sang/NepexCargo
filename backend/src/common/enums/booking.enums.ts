export enum BookingSource {
  MANUAL = 'manual',
  BULK_IMPORT = 'bulk_import',
  QUOTE_REQUEST = 'quote_request',
}

export enum BookingStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum ProtectionType {
  FREE = 'free',
  OPT_OUT = 'opt_out',
  INSURED = 'insured',
}

export enum BookingDocumentType {
  AIRWAYBILL = 'airwaybill',
  COMMERCIAL_INVOICE = 'commercial_invoice',
  CUSTOMS_INVOICE = 'customs_invoice',
}

export enum QuoteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}
