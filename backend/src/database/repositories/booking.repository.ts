import { AppDataSource } from '../data-source';
import { Booking } from '../entities/booking.entity';
import { BookingStatus } from '../../common/enums/booking.enums';

export const bookingRepository = AppDataSource.getRepository(Booking).extend({
  async findByTenant(
    tenantId: string,
    opts: { page: number; limit: number; status?: BookingStatus; createdByUserId?: string },
  ): Promise<[Booking[], number]> {
    const qb = this.createQueryBuilder('b')
      .where('b.tenantId = :tenantId', { tenantId })
      .orderBy('b.createdAt', 'DESC')
      .skip((opts.page - 1) * opts.limit)
      .take(opts.limit);

    if (opts.status) qb.andWhere('b.status = :status', { status: opts.status });
    // Scope to a specific user when caller is not an owner
    if (opts.createdByUserId) qb.andWhere('b.createdByUserId = :uid', { uid: opts.createdByUserId });

    return qb.getManyAndCount();
  },

  async findByTenantAndId(
    tenantId: string,
    id: string,
    createdByUserId?: string,
  ): Promise<Booking | null> {
    const where: Record<string, unknown> = { id, tenantId };
    if (createdByUserId) where.createdByUserId = createdByUserId;

    return this.findOne({
      where,
      relations: ['createdByUser', 'createdByAgent', 'rateCard', 'integration'],
    });
  },

  async findByAwb(airwayBillNumber: string): Promise<Booking | null> {
    return this.findOne({ where: { airwayBillNumber } });
  },
});
