import { Request, Response, NextFunction } from 'express';
import { countryService } from '@services/country.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import type { ListCountriesQuery } from '@common/dto/country.dto';

export async function listCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as ListCountriesQuery;
    const result = await countryService.list(query);

    ApiResponse.paginated(res, result.countries, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    next(error);
  }
}
