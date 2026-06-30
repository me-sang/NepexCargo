import 'reflect-metadata';
import { startShipmentWorker } from '../queues/consumers/shipment.consumer';
import { startEmailWorker } from '../queues/consumers/email.consumer';
import { startRateImportWorker } from '../queues/consumers/rate-import.consumer';
import { redisClient } from '../config/redis.config';
import { AppDataSource } from '../database/data-source';
import { logger } from '../common/helpers/logger';

async function bootstrap() {
  await AppDataSource.initialize();
  logger.info('Worker DB connection established');

  await redisClient.connect();
  logger.info('Worker Redis connection established');

  const workers = [startShipmentWorker(), startEmailWorker(), startRateImportWorker()];
  logger.info(`Started ${workers.length} workers`);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — stopping workers`);
    await Promise.all(workers.map((w) => w.close()));
    await AppDataSource.destroy();
    await redisClient.quit();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Worker bootstrap failed', err);
  process.exit(1);
});
