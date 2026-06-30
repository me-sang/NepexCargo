import { AppDataSource } from '@database/data-source';
import { Zone } from '@database/entities/zone.entity';
import { RateCard } from '@database/entities/rate-card.entity';
import { WeightUnit } from '@common/enums/rate.enums';
import type { CheckRatesInput } from '@common/dto/shipment.dto';

// ── Weight conversion ─────────────────────────────────────────────────────────

// All conversions go through kg as the base unit
const TO_KG: Record<WeightUnit, number> = {
  [WeightUnit.KG]: 1,
  [WeightUnit.G]: 0.001,
  [WeightUnit.LB]: 0.453592,
  [WeightUnit.OZ]: 0.0283495,
  [WeightUnit.TON]: 1000,
};

function convertWeight(weight: number, from: WeightUnit, to: WeightUnit): number {
  const kg = weight * TO_KG[from];
  return kg / TO_KG[to];
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RateOption {
  rateCardId: string;
  name: string | null;
  currency: string;
  weightUnit: WeightUnit;
  chargeableWeight: number;
  destinationZone: { id: string; name: string };
  tier: {
    minWeight: number;
    maxWeight: number | null;
    price: number;
    flatPrice: number | null;
    total: number;
  } | null;
}

export interface CheckRatesResult {
  sourceCountry: string;
  destinationCountry: string;
  destinationZone: { id: string; name: string } | null;
  inputWeight: number;
  inputWeightUnit: WeightUnit;
  rates: RateOption[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function checkRates(
  tenantId: string,
  input: CheckRatesInput,
): Promise<CheckRatesResult> {
  const { minWeight, weightUnit, sourceLocation, destinationLocation } = input;

  const base: Omit<CheckRatesResult, 'destinationZone' | 'rates'> = {
    sourceCountry: sourceLocation,
    destinationCountry: destinationLocation,
    inputWeight: minWeight,
    inputWeightUnit: weightUnit,
  };

  // 1. Find the zone that covers the destination country
  const zones = await AppDataSource.getRepository(Zone).find({ where: { tenantId } });
  const destinationZone = zones.find((z) => z.zoneFor?.includes(destinationLocation)) ?? null;

  if (!destinationZone) {
    return { ...base, destinationZone: null, rates: [] };
  }

  const zoneRef = { id: destinationZone.id, name: destinationZone.name };

  // 2. Find active rate cards for this origin country → destination zone
  const cards = await AppDataSource.getRepository(RateCard).find({
    where: {
      tenantId,
      active: true,
      originCountry: sourceLocation,
      destinationZoneId: destinationZone.id,
    },
    relations: ['weightTiers'],
    order: { name: 'ASC' },
  });

  if (cards.length === 0) {
    return { ...base, destinationZone: zoneRef, rates: [] };
  }

  // 3. For each card find the applicable weight tier using "round up to next break" logic
  const rates: RateOption[] = cards.map((card) => {
    const chargeableWeight = convertWeight(minWeight, weightUnit, card.weightUnit as WeightUnit);

    // Sort tiers ascending by maxWeight; null (open upper bound) goes last
    const sortedTiers = [...(card.weightTiers ?? [])].sort((a, b) => {
      if (a.maxWeight === null) return 1;
      if (b.maxWeight === null) return -1;
      return Number(a.maxWeight) - Number(b.maxWeight);
    });

    // Pick the first tier whose maxWeight covers the chargeable weight
    const tier = sortedTiers.find(
      (t) => t.maxWeight === null || Number(t.maxWeight) >= chargeableWeight,
    ) ?? null;

    return {
      rateCardId: card.id,
      name: card.name,
      currency: card.currency,
      weightUnit: card.weightUnit as WeightUnit,
      chargeableWeight,
      destinationZone: zoneRef,
      tier: tier
        ? {
            minWeight: Number(tier.minWeight),
            maxWeight: tier.maxWeight !== null ? Number(tier.maxWeight) : null,
            price: Number(tier.pricePerUnit),
            flatPrice: tier.flatPrice !== null ? Number(tier.flatPrice) : null,
            total: Number(tier.pricePerUnit) + (tier.flatPrice !== null ? Number(tier.flatPrice) : 0),
          }
        : null,
    };
  });

  return { ...base, destinationZone: zoneRef, rates };
}
