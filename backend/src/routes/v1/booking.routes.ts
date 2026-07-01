import { Router } from 'express';
import { userAuth } from '@common/middlewares/auth.middleware';
import { validate } from '@common/middlewares/validate.middleware';
import { createBookingSchema, listBookingsQuerySchema } from '@common/dto/booking.dto';
import { listBookings, createBooking, getBooking, cancelBooking } from '@controllers/booking-management.controller';

export const bookingRoutes: Router = Router();

// All routes require a valid user JWT
bookingRoutes.use(userAuth);

bookingRoutes.get('/', validate(listBookingsQuerySchema, 'query'), listBookings);
bookingRoutes.post('/', validate(createBookingSchema), createBooking);
bookingRoutes.get('/:id', getBooking);
bookingRoutes.post('/:id/cancel', cancelBooking);
