import { AppDataSource } from '../data-source';
import { logger } from '../../common/helpers/logger';

export interface SeederMeta {
  name: string;
  run: () => Promise<void>;
}

const SEEDER_TABLE = 'typeorm_seeders';

async function ensureTable(): Promise<void> {
  await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS ${SEEDER_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function hasRun(name: string): Promise<boolean> {
  const rows = await AppDataSource.query(
    `SELECT 1 FROM ${SEEDER_TABLE} WHERE name = $1`,
    [name],
  );
  return rows.length > 0;
}

async function markRun(name: string): Promise<void> {
  await AppDataSource.query(
    `INSERT INTO ${SEEDER_TABLE} (name) VALUES ($1) ON CONFLICT DO NOTHING`,
    [name],
  );
}

export async function runSeeders(seeders: SeederMeta[]): Promise<void> {
  await ensureTable();

  for (const seeder of seeders) {
    if (await hasRun(seeder.name)) {
      logger.info(`[Seeder] Skipping ${seeder.name} (already run)`);
      continue;
    }
    logger.info(`[Seeder] Running ${seeder.name}`);
    await seeder.run();
    await markRun(seeder.name);
    logger.info(`[Seeder] Completed ${seeder.name}`);
  }
}
