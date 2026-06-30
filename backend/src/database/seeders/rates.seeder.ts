import * as fs from 'fs';
import * as path from 'path';
import { tenantRepository } from '../repositories';
import { importZones, importRates } from '../../services/rate-import-export.service';
import { logger } from '../../common/helpers/logger';

const TENANT_CODE = 'NEPEX-001';
const DATA_DIR = path.join(__dirname, 'data');

export const ratesSeeder = {
  name: '007-nepal-rates',
  run: async (): Promise<void> => {
    const tenant = await tenantRepository.findByCode(TENANT_CODE);
    if (!tenant) throw new Error(`Tenant '${TENANT_CODE}' not found — run default-tenant seeder first`);

    const zonesCsv = fs.readFileSync(path.join(DATA_DIR, 'zones.csv'));
    const ratesCsv = fs.readFileSync(path.join(DATA_DIR, 'rates.csv'));

    const zoneResult = await importZones(tenant.id, zonesCsv, 'text/csv');
    logger.info('[Seeder] Zones imported', zoneResult);

    const rateResult = await importRates(tenant.id, ratesCsv, 'text/csv');
    logger.info('[Seeder] Rates imported', rateResult);
  },
};
