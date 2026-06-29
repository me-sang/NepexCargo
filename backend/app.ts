import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import swaggerUi from 'swagger-ui-express';
import { v1Router } from './src/routes/v1';
import { swaggerSpec } from './src/docs';
import { errorHandler } from './src/common/middlewares/error-handler.middleware';
import { requestLogger } from './src/common/middlewares/request-logger.middleware';
import { rateLimiter } from './src/common/middlewares/rate-limiter.middleware';
import { env } from './src/config/env.config';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(compression());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}

app.use('/api/v1', v1Router);

app.use(errorHandler);

export { app };
