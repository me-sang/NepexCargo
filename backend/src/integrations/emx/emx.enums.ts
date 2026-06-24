/**
 * Enumerations for the EMX (Emirates Post) shipping API.
 *
 * Member identifiers follow the project's UPPER_CASE convention; the string
 * VALUES are the exact tokens EMX expects on the wire. Values marked
 * `// confirmed` appear verbatim in the Postman collection ("Emirates Post APIs
 * Integration"); those marked `// inferred` are the obvious complementary
 * options and SHOULD be verified against the official EMX docs before use.
 */

/** Unit used for {@link EmxWeight.value}. */
export enum EmxWeightUnit {
  GRAMS = 'Grams', // confirmed
  KILOGRAMS = 'Kilograms', // inferred
}

/** Unit used for {@link EmxDimensions} length/width/height. */
export enum EmxDimensionUnit {
  METER = 'Meter', // confirmed
  CENTIMETER = 'Centimeter', // inferred
  INCH = 'Inch', // inferred
}

/** Product / service offering the shipment is booked under. */
export enum EmxProductCode {
  DOMESTIC = 'Domestic', // confirmed
  INTERNATIONAL = 'International', // inferred
}

/** Additional service level applied to the shipment. */
export enum EmxServiceType {
  NONE = 'None', // confirmed
}

/** Controls what document(s) the create-shipment call renders into `AWBLabel`. */
export enum EmxPrintType {
  AWB_ONLY = 'AWBOnly', // confirmed
  AWB_AND_INVOICE = 'AWBAndInvoice', // inferred
  NONE = 'None', // inferred
}

/** How the shipment is delivered to the consignee. */
export enum EmxDeliveryType {
  DOOR_TO_DOOR = 'DoorToDoor', // confirmed
  DOOR_TO_COUNTER = 'DoorToCounter', // inferred
  COUNTER_TO_DOOR = 'CounterToDoor', // inferred
}

/** Nature of the shipment contents. */
export enum EmxContentType {
  NON_DOCUMENT = 'NonDocument', // confirmed
  DOCUMENT = 'Document', // inferred
}

/**
 * ISO-4217 currency codes accepted by EMX money fields.
 * Only AED is present in the collection; extend as the integration grows.
 */
export enum EmxCurrency {
  AED = 'AED', // confirmed
}
