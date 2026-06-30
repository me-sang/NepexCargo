export enum RateCardType {
  ZONE = 'zone',
  ROUTE = 'route',
}

/** Declares whether a zone is used as a shipment origin, destination, or either. */
export enum ZoneFor {
  ORIGIN = 'origin',
  DESTINATION = 'destination',
  BOTH = 'both',
}

/** Unit in which all weight tiers on a rate card are expressed. */
export enum WeightUnit {
  KG = 'kg',
  G = 'g',
  LB = 'lb',
  OZ = 'oz',
  TON = 't',
}
