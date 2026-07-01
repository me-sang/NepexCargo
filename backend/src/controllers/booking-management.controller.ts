import { Request, Response, NextFunction } from 'express';
import { bookingManagementService } from '@services/booking-management.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { ForbiddenException } from '@common/exceptions/app.exception';
import type { CreateBookingDTO, UpdateBookingStatusDTO, ListBookingsQuery } from '@common/dto/booking.dto';

function tenantId(req: Request): string {
  const id = req.user?.tenantId;
  if (!id) throw new ForbiddenException('No tenant associated with this account');
  return id;
}

function userId(req: Request): string {
  const id = req.user?.id;
  if (!id) throw new ForbiddenException('Unauthenticated');
  return id;
}

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await bookingManagementService.list(tenantId(req), req.query as unknown as ListBookingsQuery);
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
    const booking = await bookingManagementService.create(tenantId(req), userId(req), req.body as CreateBookingDTO);
    ApiResponse.created(res, booking);
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await bookingManagementService.getById(tenantId(req), req.params.id);
    ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await bookingManagementService.updateStatus(
      tenantId(req),
      req.params.id,
      req.body as UpdateBookingStatusDTO,
    );
    ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await bookingManagementService.cancel(tenantId(req), req.params.id);
    ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
}
