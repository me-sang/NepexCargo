import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { superAdminRoutes } from './super-admin.routes';
import { userRoutes } from './user.routes';
import { rateManagementRoutes } from './rate-management.routes';
import { shipmentRoutes } from './shipment.routes';

export const v1Router: ExpressRouter = Router();

v1Router.use('/admin', superAdminRoutes);
v1Router.use('/', userRoutes);
v1Router.use('/tenant', rateManagementRoutes);
v1Router.use('/shipment', shipmentRoutes);
