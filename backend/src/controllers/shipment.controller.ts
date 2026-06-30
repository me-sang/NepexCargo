import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { checkRates } from '@services/rate-check.service';
import type { CheckRatesInput } from '@common/dto/shipment.dto';

export async function checkRatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await checkRates(req.body as CheckRatesInput);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}
