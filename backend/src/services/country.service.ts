import { Country } from '@database/entities/country.entity';
import { countryRepository } from '@database/repositories/country.repository';
import type { ListCountriesQuery } from '@common/dto/country.dto';

class CountryService {
  async list(
    query: ListCountriesQuery,
  ): Promise<{ countries: Country[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [countries, total] = await countryRepository.search({
      page,
      limit,
      search: query.search,
      isActive: query.isActive,
    });

    return { countries, total, page, limit };
  }
}

export const countryService = new CountryService();
