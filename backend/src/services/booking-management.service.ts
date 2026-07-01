import { AppDataSource } from '@database/data-source';
import { Booking } from '@database/entities/booking.entity';
import { bookingRepository } from '@database/repositories/booking.repository';
import { NotFoundException, BadRequestException } from '@common/exceptions/app.exception';
import { BookingStatus } from '@common/enums/booking.enums';
import type { CreateBookingDTO, UpdateBookingStatusDTO, ListBookingsQuery } from '@common/dto/booking.dto';

function generateAwb(): string {
  const prefix = 'NPX';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

class BookingManagementService {
  private repo = AppDataSource.getRepository(Booking);

  async list(
    tenantId: string,
    query: ListBookingsQuery,
  ): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [bookings, total] = await bookingRepository.findByTenant(tenantId, { page, limit, status: query.status });
    return { bookings, total, page, limit };
  }

  async create(tenantId: string, userId: string, data: CreateBookingDTO): Promise<Booking> {
    const airwayBillNumber = generateAwb();

    const booking = this.repo.create({
      tenantId,
      createdByUserId: userId,
      airwayBillNumber,
      source: data.source,
      rateCardId: data.rateCardId ?? null,
      integrationId: data.integrationId ?? null,
      sender: data.sender,
      receiver: data.receiver,
      shipmentDetails: data.shipmentDetails,
      protectionType: data.protectionType,
      protectionValue: data.protectionValue ?? null,
      currency: data.currency,
      notes: data.notes ?? null,
      status: BookingStatus.DRAFT,
    });

    return this.repo.save(booking);
  }

  async getById(tenantId: string, id: string): Promise<Booking> {
    const booking = await bookingRepository.findByTenantAndId(tenantId, id);
    if (!booking) throw new NotFoundException('Booking');
    return booking;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    data: UpdateBookingStatusDTO,
  ): Promise<Booking> {
    const booking = await this.getById(tenantId, id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update status of a cancelled booking');
    }

    booking.status = data.status;
    if (data.notes) booking.notes = data.notes;

    return this.repo.save(booking);
  }

  async cancel(tenantId: string, id: string): Promise<Booking> {
    const booking = await this.getById(tenantId, id);

    if (
      booking.status === BookingStatus.DELIVERED ||
      booking.status === BookingStatus.IN_TRANSIT
    ) {
      throw new BadRequestException(`Cannot cancel a booking with status '${booking.status}'`);
    }

    booking.status = BookingStatus.CANCELLED;
    return this.repo.save(booking);
  }
}

export const bookingManagementService = new BookingManagementService();
