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

  async search(opts: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }): Promise<[Country[], number]> {
    const qb = this.createQueryBuilder('c')
      .select(['c.id', 'c.name', 'c.iso2'])
      .orderBy('c.name', 'ASC')
      .skip((opts.page - 1) * opts.limit)
      .take(opts.limit);

    if (opts.search) {
      qb.andWhere('(c.name ILIKE :search OR c.iso2 ILIKE :search)', { search: `%${opts.search}%` });
    }
    if (opts.isActive !== undefined) {
      qb.andWhere('c.isActive = :isActive', { isActive: opts.isActive });
    }

    return qb.getManyAndCount();
  },
});
