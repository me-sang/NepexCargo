import { Request, Response, NextFunction } from 'express';
import { bookingManagementService } from '@services/booking-management.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { ForbiddenException } from '@common/exceptions/app.exception';
import type { CreateBookingDTO, ListBookingsQuery } from '@common/dto/booking.dto';
import { tenantRepository } from '@database/repositories/tenant.repository';
import { DEFAULT_TENANT_CODE } from '@database/seeders/default-tenant.seeder';

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveUser(req: Request): { userId: string; tenantId: string } {
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!userId) throw new ForbiddenException('Authentication required');
  // if (!tenantId) throw new ForbiddenException('Your account is not associated with any tenant');

  return { userId, tenantId };
}

// ── Handlers ───────────────────────────────────────────────────────────────────

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, tenantId } = resolveUser(req);
    const query = req.query as unknown as ListBookingsQuery;

    const result = await bookingManagementService.list(tenantId, userId, query);

    ApiResponse.paginated(res, result.bookings, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookingData = req.body as CreateBookingDTO;
    const { userId } = resolveUser(req);
    const tenantData = await tenantRepository.findByCode(DEFAULT_TENANT_CODE);
    const booking = await bookingManagementService.create(tenantData.id, userId, bookingData);
    ApiResponse.created(res, booking);
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, tenantId } = resolveUser(req);
    const booking = await bookingManagementService.getById(tenantId, userId, req.params.id);
    ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, tenantId } = resolveUser(req);
    const booking = await bookingManagementService.cancel(tenantId, userId, req.params.id);
    ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
}
