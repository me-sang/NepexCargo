import { Router } from 'express';
import { validate } from '@common/middlewares/validate.middleware';
import { listCountriesQuerySchema } from '@common/dto/country.dto';
import { listCountries } from '@controllers/country.controller';

export const countryRoutes: Router = Router();

countryRoutes.get('/', validate(listCountriesQuerySchema, 'query'), listCountries);
