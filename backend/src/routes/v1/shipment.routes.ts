import { Router } from 'express';
import { validate } from '@common/middlewares/validate.middleware';
import { checkRatesSchema } from '@common/dto/shipment.dto';
import { checkRatesHandler } from '@controllers/shipment.controller';

export const shipmentRoutes: Router = Router();

shipmentRoutes.post('/international/check-rates', validate(checkRatesSchema), checkRatesHandler);
