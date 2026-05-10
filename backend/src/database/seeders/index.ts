import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { runSeeders } from './seeder-tracker';
import { logger } from '../../common/helpers/logger';

// Import seeders here as they are added, e.g.:
// import { roleSeeder } from './001-roles.seeder';

const seeders = [
  // { name: '001-roles', run: roleSeeder },
];

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
