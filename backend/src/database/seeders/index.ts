import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { runSeeders } from './seeder-tracker';
import { logger } from '../../common/helpers/logger';
import { permissionSeeder, roleSeeder } from './roles-permissions.seeder';
import { countrySeeder } from './country.seeder';
import { superAdminSeeder } from './super-admin.seeder';
import { planSeeder } from './plan.seeder';
import { defaultTenantSeeder } from './default-tenant.seeder';
import { ratesSeeder } from './rates.seeder';

const seeders = [permissionSeeder, roleSeeder, countrySeeder, superAdminSeeder, planSeeder, defaultTenantSeeder, ratesSeeder];

async function main() {
  await AppDataSource.initialize();
  logger.info('Running seeders...');
  await runSeeders(seeders);
  logger.info('All seeders done');
  await AppDataSource.destroy();
}

main().catch((err) => {
  logger.error('Seeder failed', err);
  process.exit(1);
});
