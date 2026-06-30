import { Router } from 'express';
import { checkPermission } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { checkRatesSchema } from '@common/dto/shipment.dto';
import { checkRatesHandler } from '@controllers/shipment.controller';

export const shipmentRoutes: Router = Router();

const auth = checkPermission();

shipmentRoutes.post('/international/check-rates', auth, validate(checkRatesSchema), checkRatesHandler);
