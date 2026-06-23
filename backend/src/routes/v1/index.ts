import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

// Import feature routers here as they are added, e.g.:
// import { shipmentRoutes } from '../../controllers/shipment/shipment.routes';

export const v1Router: ExpressRouter = Router();

// v1Router.use('/shipments', shipmentRoutes);
// v1Router.use('/users', userRoutes);
// v1Router.use('/payments', paymentRoutes);
