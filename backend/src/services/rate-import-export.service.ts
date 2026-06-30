import { AppDataSource } from '@database/data-source';
import { Zone, RateCard, WeightTier } from '@database/entities';
import { RateCardType, WeightUnit } from '@common/enums/rate.enums';
import { parseSpreadsheet, buildSpreadsheet, SheetRow } from '@common/helpers/spreadsheet.helper';
import { BadRequestException } from '@common/exceptions/app.exception';

// ── Zone import/export ────────────────────────────────────────────────────────

/**
 * Export all zones as a flat table: one row per country in zoneFor.
 *
 * zone_name | country
 * Zone 1    | BH
 * Zone 1    | OM
 * Zone 2    | NP
 */
export async function exportZones(
  tenantId: string,
  format: 'csv' | 'xlsx',
): Promise<ReturnType<typeof buildSpreadsheet>> {
  const zones = await AppDataSource.getRepository(Zone).find({
    where: { tenantId },
    order: { name: 'ASC' },
  });

  const rows: SheetRow[] = [];
  for (const zone of zones) {
    const countries = zone.zoneFor ?? [];
    if (countries.length === 0) {
      rows.push({ zone_name: zone.name, country: '' });
    } else {
      for (const iso2 of countries) {
        rows.push({ zone_name: zone.name, country: iso2 });
      }
    }
  }

  if (rows.length === 0) rows.push({ zone_name: '', country: '' });
  return buildSpreadsheet(rows, format);
}

/**
 * Import zones from a CSV/Excel file.
 *
 * Expected columns (case-insensitive): zone_name, country (ISO2)
 * Upsert behaviour: match by (tenantId, name). Updates zoneFor; creates if missing.
 * Returns counts of created and updated zones.
 */
export async function importZones(
  tenantId: string,
  buffer: Buffer,
  mimetype: string,
): Promise<{ created: number; updated: number }> {
  const rows = parseSpreadsheet(buffer, mimetype);
  if (rows.length === 0) throw new BadRequestException('File is empty');

  // Normalise header keys to lowercase with underscores
  const normalised = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, '_'), v])),
  );

  // Group countries by zone name
  const zoneMap = new Map<string, Set<string>>();
  for (const row of normalised) {
    const name = String(row['zone_name'] ?? '').trim();
    const country = String(row['country'] ?? '').trim().toUpperCase();
    if (!name) continue;
    if (!zoneMap.has(name)) zoneMap.set(name, new Set());
    if (country) zoneMap.get(name)!.add(country);
  }

  if (zoneMap.size === 0) throw new BadRequestException('No valid zone rows found');

  const zoneRepo = AppDataSource.getRepository(Zone);
  let created = 0;
  let updated = 0;

  for (const [name, countrySet] of zoneMap) {
    const countries = [...countrySet];
    const existing = await zoneRepo.findOne({ where: { tenantId, name } });

    if (existing) {
      existing.zoneFor = countries;
      await zoneRepo.save(existing);
      updated++;
    } else {
      await zoneRepo.save(zoneRepo.create({ tenantId, name, zoneFor: countries, countries, cities: [] }));
      created++;
    }
  }

  return { created, updated };
}

// ── Rate import/export ────────────────────────────────────────────────────────

const WEIGHT_COL = 'weight_kg';
const TYPE_COL = 'type';
const COUNTRY_COL = 'origin_country';

/**
 * Export rate cards as a weight × zone matrix.
 *
 * weight_kg | Zone 1 | Zone 2 | ... | type | origin_country
 * 0.5       | 1018   | 1050   | ... | DOX  | NP
 *
 * Rate cards are grouped by (name, originCountry). Each destination zone
 * becomes a column. Weights are aligned across all rate cards in the group.
 */
export async function exportRates(
  tenantId: string,
  format: 'csv' | 'xlsx',
): Promise<ReturnType<typeof buildSpreadsheet>> {
  const cards = await AppDataSource.getRepository(RateCard).find({
    where: { tenantId },
    relations: ['weightTiers', 'destinationZone'],
    order: { name: 'ASC', createdAt: 'ASC' },
  });

  if (cards.length === 0) {
    return buildSpreadsheet([{ [WEIGHT_COL]: '', [TYPE_COL]: '', [COUNTRY_COL]: '' }], format);
  }

  // Group cards by (type=name, originCountry)
  type GroupKey = string;
  const groups = new Map<GroupKey, { type: string; originCountry: string; cards: RateCard[] }>();

  for (const card of cards) {
    const type = card.name ?? 'DEFAULT';
    const origin = card.originCountry ?? card.originZoneId ?? '';
    const key = `${type}||${origin}`;
    if (!groups.has(key)) groups.set(key, { type, originCountry: String(origin), cards: [] });
    groups.get(key)!.cards.push(card);
  }

  const rows: SheetRow[] = [];

  for (const { type, originCountry, cards: groupCards } of groups.values()) {
    // Collect all zone names and all weights across this group
    const zoneNames: string[] = [];
    const weightSet = new Set<number>();

    for (const card of groupCards) {
      const zoneName = card.destinationZone?.name ?? card.destinationZoneId ?? 'Unknown';
      if (!zoneNames.includes(String(zoneName))) zoneNames.push(String(zoneName));
      for (const tier of card.weightTiers ?? []) {
        if (tier.maxWeight != null) weightSet.add(Number(tier.maxWeight));
      }
    }
    zoneNames.sort();
    const weights = [...weightSet].sort((a, b) => a - b);

    // Build a lookup: zoneName → Map<maxWeight, pricePerUnit>
    const priceMap = new Map<string, Map<number, number>>();
    for (const card of groupCards) {
      const zoneName = String(card.destinationZone?.name ?? card.destinationZoneId ?? 'Unknown');
      if (!priceMap.has(zoneName)) priceMap.set(zoneName, new Map());
      for (const tier of card.weightTiers ?? []) {
        if (tier.maxWeight != null) {
          priceMap.get(zoneName)!.set(Number(tier.maxWeight), Number(tier.pricePerUnit));
        }
      }
    }

    // Emit one row per weight
    for (const weight of weights) {
      const row: SheetRow = { [WEIGHT_COL]: weight };
      for (const zone of zoneNames) {
        row[zone] = priceMap.get(zone)?.get(weight) ?? null;
      }
      row[TYPE_COL] = type;
      row[COUNTRY_COL] = originCountry;
      rows.push(row);
    }
  }

  return buildSpreadsheet(rows, format);
}

/**
 * Import rates from a weight × zone matrix file.
 *
 * Expected columns: weight_kg (or "Weight (kg)"), one column per zone name,
 * type (or "Type"), origin_country (or "Country").
 *
 * For each (type, origin_country) group and each zone column:
 *   - Find or create the destination Zone by name
 *   - Find or create the RateCard (name=type, route-based, originCountry=origin_country)
 *   - Replace all weight tiers (upsert = delete + re-insert)
 */
export async function importRates(
  tenantId: string,
  buffer: Buffer,
  mimetype: string,
): Promise<{ zonesFound: number; zonesCreated: number; cardsUpserted: number }> {
  const raw = parseSpreadsheet(buffer, mimetype);
  if (raw.length === 0) throw new BadRequestException('File is empty');

  // Normalise header aliases
  const normalised = raw.map((r) => {
    const out: SheetRow = {};
    for (const [k, v] of Object.entries(r)) {
      const norm = k.trim().toLowerCase();
      if (norm === 'weight (kg)' || norm === 'weight(kg)' || norm === 'weight_kg') {
        out[WEIGHT_COL] = v;
      } else if (norm === 'type') {
        out[TYPE_COL] = v;
      } else if (norm === 'country' || norm === 'origin_country' || norm === 'origin country') {
        out[COUNTRY_COL] = v;
      } else {
        out[k.trim()] = v; // preserve zone column names as-is
      }
    }
    return out;
  });

  // Extract zone column names (everything that isn't weight/type/country)
  const reservedKeys = new Set([WEIGHT_COL, TYPE_COL, COUNTRY_COL]);
  const zoneColumns = Object.keys(normalised[0]).filter((k) => !reservedKeys.has(k));

  if (zoneColumns.length === 0) throw new BadRequestException('No zone columns found in file');

  // Group rows by (type, origin_country)
  type GroupKey = string;
  const groups = new Map<GroupKey, { type: string; originCountry: string; rows: SheetRow[] }>();

  for (const row of normalised) {
    const type = String(row[TYPE_COL] ?? 'DEFAULT').trim();
    const origin = String(row[COUNTRY_COL] ?? '').trim().toUpperCase();
    const weight = Number(row[WEIGHT_COL]);
    if (isNaN(weight)) continue;
    const key = `${type}||${origin}`;
    if (!groups.has(key)) groups.set(key, { type, originCountry: origin, rows: [] });
    groups.get(key)!.rows.push(row);
  }

  if (groups.size === 0) throw new BadRequestException('No valid rate rows found');

  const zoneRepo = AppDataSource.getRepository(Zone);
  const cardRepo = AppDataSource.getRepository(RateCard);
  const tierRepo = AppDataSource.getRepository(WeightTier);

  let zonesFound = 0;
  let zonesCreated = 0;
  let cardsUpserted = 0;

  // Resolve / create all zones upfront
  const zoneCache = new Map<string, Zone>();
  for (const colName of zoneColumns) {
    const existing = await zoneRepo.findOne({ where: { tenantId, name: colName } });
    if (existing) {
      zoneCache.set(colName, existing);
      zonesFound++;
    } else {
      const created = await zoneRepo.save(
        zoneRepo.create({ tenantId, name: colName, zoneFor: [], countries: [], cities: [] }),
      );
      zoneCache.set(colName, created);
      zonesCreated++;
    }
  }

  // Process each group × zone column
  for (const { type, originCountry, rows: groupRows } of groups.values()) {
    // Sort rows by weight ascending to compute minWeight ranges
    const sorted = [...groupRows].sort(
      (a, b) => Number(a[WEIGHT_COL]) - Number(b[WEIGHT_COL]),
    );

    for (const colName of zoneColumns) {
      const zone = zoneCache.get(colName)!;

      // Find or create rate card
      let card = await cardRepo.findOne({
        where: {
          tenantId,
          name: type,
          type: RateCardType.ROUTE,
          originCountry,
          destinationZoneId: zone.id,
        },
      });

      if (!card) {
        card = await cardRepo.save(
          cardRepo.create({
            tenantId,
            name: type,
            type: RateCardType.ROUTE,
            originCountry,
            destinationZoneId: zone.id,
            currency: 'USD',
            weightUnit: WeightUnit.KG,
            active: true,
          }),
        );
      }

      // Replace weight tiers
      await tierRepo.delete({ rateCardId: card.id });

      const tiers: Partial<WeightTier>[] = [];
      let prevWeight = 0;
      for (const row of sorted) {
        const maxWeight = Number(row[WEIGHT_COL]);
        const price = Number(row[colName]);
        if (isNaN(maxWeight) || isNaN(price)) continue;
        tiers.push({
          rateCardId: card.id,
          minWeight: prevWeight,
          maxWeight,
          pricePerUnit: price,
          flatPrice: null,
        });
        prevWeight = maxWeight;
      }

      if (tiers.length > 0) await tierRepo.save(tiers.map((t) => tierRepo.create(t)));
      cardsUpserted++;
    }
  }

  return { zonesFound, zonesCreated, cardsUpserted };
}

// ── Sample templates ──────────────────────────────────────────────────────────

export function sampleZones(format: 'csv' | 'xlsx'): ReturnType<typeof buildSpreadsheet> {
  const rows: SheetRow[] = [
    { zone_name: 'Zone A', country: 'NP' },
    { zone_name: 'Zone A', country: 'IN' },
    { zone_name: 'Zone B', country: 'US' },
    { zone_name: 'Zone B', country: 'GB' },
    { zone_name: 'Zone C', country: 'AE' },
  ];
  return buildSpreadsheet(rows, format);
}

export function sampleRates(format: 'csv' | 'xlsx'): ReturnType<typeof buildSpreadsheet> {
  const rows: SheetRow[] = [
    { weight_kg: 0.5, 'Zone A': 10.0, 'Zone B': 12.0, 'Zone C': 15.0, type: 'STANDARD', origin_country: 'NP' },
    { weight_kg: 1, 'Zone A': 18.0, 'Zone B': 22.0, 'Zone C': 28.0, type: 'STANDARD', origin_country: 'NP' },
    { weight_kg: 2, 'Zone A': 30.0, 'Zone B': 36.0, 'Zone C': 45.0, type: 'STANDARD', origin_country: 'NP' },
    { weight_kg: 5, 'Zone A': 65.0, 'Zone B': 80.0, 'Zone C': 100.0, type: 'STANDARD', origin_country: 'NP' },
    { weight_kg: 10, 'Zone A': 110.0, 'Zone B': 140.0, 'Zone C': 175.0, type: 'STANDARD', origin_country: 'NP' },
  ];
  return buildSpreadsheet(rows, format);
}
