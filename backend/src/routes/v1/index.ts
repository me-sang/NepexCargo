import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { superAdminRoutes } from './super-admin.routes';

export const v1Router: ExpressRouter = Router();

v1Router.use('/admin', superAdminRoutes);
