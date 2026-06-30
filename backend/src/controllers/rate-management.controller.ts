import { Request, Response, NextFunction } from 'express';
import { rateManagementService } from '@services/rate-management.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { ForbiddenException } from '@common/exceptions/app.exception';
import type {
  CreateZoneDTO,
  UpdateZoneDTO,
  CreateRateCardDTO,
  UpdateRateCardDTO,
} from '@common/dto/rate.dto';

function tenantId(req: Request): string {
  const id = req.user?.tenantId;
  if (!id) throw new ForbiddenException('No tenant associated with this account');
  return id;
}

// ── Zones ─────────────────────────────────────────────────────────────────────

export async function listZones(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zones = await rateManagementService.listZones(tenantId(req));
    ApiResponse.success(res, zones);
  } catch (error) {
    next(error);
  }
}

export async function getZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zone = await rateManagementService.getZone(tenantId(req), req.params.id);
    ApiResponse.success(res, zone);
  } catch (error) {
    next(error);
  }
}

export async function createZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zone = await rateManagementService.createZone(tenantId(req), req.body as CreateZoneDTO);
    ApiResponse.created(res, zone);
  } catch (error) {
    next(error);
  }
}

export async function updateZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zone = await rateManagementService.updateZone(
      tenantId(req),
      req.params.id,
      req.body as UpdateZoneDTO,
    );
    ApiResponse.success(res, zone);
  } catch (error) {
    next(error);
  }
}

export async function deleteZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await rateManagementService.deleteZone(tenantId(req), req.params.id);
    ApiResponse.noContent(res);
  } catch (error) {
    next(error);
  }
}

// ── Rate Cards ────────────────────────────────────────────────────────────────

export async function listRateCards(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cards = await rateManagementService.listRateCards(tenantId(req));
    ApiResponse.success(res, cards);
  } catch (error) {
    next(error);
  }
}

export async function getRateCard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const card = await rateManagementService.getRateCard(tenantId(req), req.params.id);
    ApiResponse.success(res, card);
  } catch (error) {
    next(error);
  }
}

export async function createRateCard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const card = await rateManagementService.createRateCard(
      tenantId(req),
      req.body as CreateRateCardDTO,
    );
    ApiResponse.created(res, card);
  } catch (error) {
    next(error);
  }
}

export async function updateRateCard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const card = await rateManagementService.updateRateCard(
      tenantId(req),
      req.params.id,
      req.body as UpdateRateCardDTO,
    );
    ApiResponse.success(res, card);
  } catch (error) {
    next(error);
  }
}

export async function deleteRateCard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await rateManagementService.deleteRateCard(tenantId(req), req.params.id);
    ApiResponse.noContent(res);
  } catch (error) {
    next(error);
  }
}
