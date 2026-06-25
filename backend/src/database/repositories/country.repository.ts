import { AppDataSource } from '../data-source';
import { Country } from '../entities';

export const countryRepository = AppDataSource.getRepository(Country).extend({
  /** Primary lookup — used when resolving a country from a shipping form or API payload. */
  async findByIso2(iso2: string): Promise<Country | null> {
    return this.findOne({ where: { iso2: iso2.toUpperCase() } });
  },

  async findByIso3(iso3: string): Promise<Country | null> {
    return this.findOne({ where: { iso3: iso3.toUpperCase() } });
  },

  async findAllActive(): Promise<Country[]> {
    return this.find({ where: { isActive: true }, order: { name: 'ASC' } });
  },
});
