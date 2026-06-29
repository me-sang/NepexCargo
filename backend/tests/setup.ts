import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';

if (process.env.NODE_ENV !== 'test') {
  throw new Error(
    `Tests must run with NODE_ENV=test. Got "${process.env.NODE_ENV}". ` +
      'Make sure .env.test exists and jest.config.ts loads it.'
  );
}

if (!process.env.DB_NAME || process.env.DB_NAME === 'nepex_cargo_db') {
  throw new Error(
    'Tests are pointed at the development database (nepex_cargo_db). ' +
      'Set DB_NAME to a dedicated test database in .env.test to avoid wiping dev data.'
  );
}

// Unit tests do not require a database connection.
// Skip DB init when running only tests under tests/unit/.
const isUnitOnly =
  process.env.JEST_WORKER_ID !== undefined &&
  (expect as unknown as { getState: () => { testPath?: string } })
    .getState()
    ?.testPath?.includes('/tests/unit/') === true;

if (!isUnitOnly) {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
}
