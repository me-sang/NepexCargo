import { countryRepository } from '../repositories';
import countriesData from './data/countries.json';

export const countrySeeder = {
  name: '003-countries',
  run: async (): Promise<void> => {
    const countries = countriesData.map((c) => ({
      name: c.name,
      iso2: c.iso2,
      iso3: c.iso3,
      numeric: c.numeric,
      phoneCode: c.phone_code,
      currency: c.currency,
      isActive: true,
    }));

    await countryRepository.upsert(countries, {
      conflictPaths: ['iso2'],
      skipUpdateIfNoValuesChanged: true,
    });
  },
};
