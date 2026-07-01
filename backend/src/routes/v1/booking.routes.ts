import { Router } from 'express';
import { checkRole } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { UserRole } from '@config/permission.enums';
import { createBookingSchema, updateBookingStatusSchema, listBookingsQuerySchema } from '@common/dto/booking.dto';
import {
  listBookings,
  createBooking,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} from '@controllers/booking-management.controller';

export const bookingRoutes: Router = Router();

// All booking routes require partner_owner or agent role
const ownerOrAgent = checkRole([UserRole.PARTNER_OWNER, UserRole.AGENT]);
const ownerOnly = checkRole([UserRole.PARTNER_OWNER]);

bookingRoutes.get('/', ownerOrAgent, validate(listBookingsQuerySchema, 'query'), listBookings);
bookingRoutes.post('/', ownerOrAgent, validate(createBookingSchema), createBooking);

// Static routes before /:id
bookingRoutes.get('/:id', ownerOrAgent, getBooking);
bookingRoutes.patch('/:id/status', ownerOnly, validate(updateBookingStatusSchema), updateBookingStatus);
bookingRoutes.post('/:id/cancel', ownerOnly, cancelBooking);
