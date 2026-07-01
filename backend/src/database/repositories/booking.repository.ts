import { AppDataSource } from '../data-source';
import { Booking } from '../entities/booking.entity';
import { BookingStatus } from '../../common/enums/booking.enums';

export const bookingRepository = AppDataSource.getRepository(Booking).extend({
  async findByTenant(
    tenantId: string,
    opts: { page: number; limit: number; status?: BookingStatus },
  ): Promise<[Booking[], number]> {
    const qb = this.createQueryBuilder('b')
      .where('b.tenantId = :tenantId', { tenantId })
      .orderBy('b.createdAt', 'DESC')
      .skip((opts.page - 1) * opts.limit)
      .take(opts.limit);

    if (opts.status) qb.andWhere('b.status = :status', { status: opts.status });

    return qb.getManyAndCount();
  },

  async findByTenantAndId(tenantId: string, id: string): Promise<Booking | null> {
    return this.findOne({
      where: { id, tenantId },
      relations: ['createdByUser', 'createdByAgent', 'rateCard', 'integration'],
    });
  },

  async findByAwb(airwayBillNumber: string): Promise<Booking | null> {
    return this.findOne({ where: { airwayBillNumber } });
  },
});
