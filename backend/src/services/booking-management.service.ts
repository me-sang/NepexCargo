import { AppDataSource } from '@database/data-source';
import { Booking } from '@database/entities/booking.entity';
import { bookingRepository } from '@database/repositories/booking.repository';
import { NotFoundException, BadRequestException, ForbiddenException } from '@common/exceptions/app.exception';
import { BookingSource, BookingStatus } from '@common/enums/booking.enums';
import type { CreateBookingDTO, ListBookingsQuery } from '@common/dto/booking.dto';

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateAwb(): string {
  const prefix = 'NPX';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

const NON_CANCELLABLE = new Set([BookingStatus.DELIVERED, BookingStatus.IN_TRANSIT]);

// ── Service ────────────────────────────────────────────────────────────────────

class BookingManagementService {
  private repo = AppDataSource.getRepository(Booking);

  async list(
    tenantId: string,
    userId: string,
    query: ListBookingsQuery,
  ): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [bookings, total] = await bookingRepository.findByTenant(tenantId, {
      page,
      limit,
      status: query.status,
      createdByUserId: userId,
    });

    return { bookings, total, page, limit };
  }

  async create(tenantId: string, userId: string, data: CreateBookingDTO): Promise<Booking> {
    const booking = this.repo.create({
      tenantId,
      createdByUserId: userId,
      airwayBillNumber: generateAwb(),
      source: BookingSource.MANUAL,
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

  async getById(tenantId: string, userId: string, bookingId: string): Promise<Booking> {
    const booking = await bookingRepository.findByTenantAndId(tenantId, bookingId, userId);
    if (!booking) throw new NotFoundException('Booking');
    return booking;
  }

  async cancel(tenantId: string, userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.getById(tenantId, userId, bookingId);

    if (booking.createdByUserId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (NON_CANCELLABLE.has(booking.status)) {
      throw new BadRequestException(
        `Booking cannot be cancelled once it is ${booking.status.replace('_', ' ')}`,
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    return this.repo.save(booking);
  }
}

export const bookingManagementService = new BookingManagementService();
