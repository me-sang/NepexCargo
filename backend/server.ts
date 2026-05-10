import 'reflect-metadata';
import { app } from './app';
import { AppDataSource } from './src/database/data-source';
import { redisClient } from './src/config/redis.config';
import { env } from './src/config/env.config';
import { logger } from './src/common/helpers/logger';

const PORT = env.PORT;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    await redisClient.connect();
    logger.info('Redis connection established');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await AppDataSource.destroy();
        await redisClient.quit();
        logger.info('Process terminated');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
