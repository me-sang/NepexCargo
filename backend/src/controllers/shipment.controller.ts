import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { ForbiddenException } from '@common/exceptions/app.exception';
import { checkRates } from '@services/rate-check.service';
import type { CheckRatesInput } from '@common/dto/shipment.dto';

function tenantId(req: Request): string {
  const id = req.user?.tenantId;
  if (!id) throw new ForbiddenException('No tenant associated with this account');
  return id;
}

export async function checkRatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await checkRates(tenantId(req), req.body as CheckRatesInput);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}
