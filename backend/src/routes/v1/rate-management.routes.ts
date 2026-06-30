import { Router } from 'express';
import { checkPermission, checkRole } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { UserRole } from '@config/permission.enums';
import {
  createZoneSchema,
  updateZoneSchema,
  createRateCardSchema,
  updateRateCardSchema,
} from '@common/dto/rate.dto';
import {
  listZones,
  getZone,
  createZone,
  updateZone,
  deleteZone,
  listRateCards,
  getRateCard,
  createRateCard,
  updateRateCard,
  deleteRateCard,
} from '@controllers/rate-management.controller';

export const rateManagementRoutes: Router = Router();

const auth = checkPermission();
const ownerOrManager = checkRole([UserRole.PARTNER_OWNER, UserRole.MANAGER]);

// ── Zones ─────────────────────────────────────────────────────────────────────
rateManagementRoutes.get('/zones', auth, listZones);
rateManagementRoutes.get('/zones/:id', auth, getZone);
rateManagementRoutes.post('/zones', auth, ownerOrManager, validate(createZoneSchema), createZone);
rateManagementRoutes.patch('/zones/:id', auth, ownerOrManager, validate(updateZoneSchema), updateZone);
rateManagementRoutes.delete('/zones/:id', auth, ownerOrManager, deleteZone);

// ── Rate Cards ────────────────────────────────────────────────────────────────
rateManagementRoutes.get('/rates', auth, listRateCards);
rateManagementRoutes.get('/rates/:id', auth, getRateCard);
rateManagementRoutes.post('/rates', auth, ownerOrManager, validate(createRateCardSchema), createRateCard);
rateManagementRoutes.patch('/rates/:id', auth, ownerOrManager, validate(updateRateCardSchema), updateRateCard);
rateManagementRoutes.delete('/rates/:id', auth, ownerOrManager, deleteRateCard);
