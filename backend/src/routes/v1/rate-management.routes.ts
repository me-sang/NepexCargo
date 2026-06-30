import { Router } from 'express';
import multer from 'multer';
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
import {
  exportZonesHandler,
  importZonesHandler,
  sampleZonesHandler,
  exportRatesHandler,
  importRatesHandler,
  sampleRatesHandler,
  importStatusHandler,
} from '@controllers/rate-import-export.controller';

export const rateManagementRoutes: Router = Router();

const auth = checkPermission();
const ownerOrManager = checkRole([UserRole.PARTNER_OWNER, UserRole.MANAGER]);

// Accept CSV and Excel uploads, stored in memory (files are small)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ];
    cb(null, allowed.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx'));
  },
});

// ── Import job status ─────────────────────────────────────────────────────────
rateManagementRoutes.get('/import/status/:jobId', auth, importStatusHandler);

// ── Zones ─────────────────────────────────────────────────────────────────────
rateManagementRoutes.get('/zones/export', auth, ownerOrManager, exportZonesHandler);
rateManagementRoutes.get('/zones/sample', auth, sampleZonesHandler);
rateManagementRoutes.post('/zones/import', auth, ownerOrManager, upload.single('file'), importZonesHandler);
rateManagementRoutes.get('/zones', auth, listZones);
rateManagementRoutes.get('/zones/:id', auth, getZone);
rateManagementRoutes.post('/zones', auth, ownerOrManager, validate(createZoneSchema), createZone);
rateManagementRoutes.patch('/zones/:id', auth, ownerOrManager, validate(updateZoneSchema), updateZone);
rateManagementRoutes.delete('/zones/:id', auth, ownerOrManager, deleteZone);

// ── Rate Cards ────────────────────────────────────────────────────────────────
rateManagementRoutes.get('/rates/export', auth, ownerOrManager, exportRatesHandler);
rateManagementRoutes.get('/rates/sample', auth, sampleRatesHandler);
rateManagementRoutes.post('/rates/import', auth, ownerOrManager, upload.single('file'), importRatesHandler);
rateManagementRoutes.get('/rates', auth, listRateCards);
rateManagementRoutes.get('/rates/:id', auth, getRateCard);
rateManagementRoutes.post('/rates', auth, ownerOrManager, validate(createRateCardSchema), createRateCard);
rateManagementRoutes.patch('/rates/:id', auth, ownerOrManager, validate(updateRateCardSchema), updateRateCard);
rateManagementRoutes.delete('/rates/:id', auth, ownerOrManager, deleteRateCard);
