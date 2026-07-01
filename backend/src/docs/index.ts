import '@config/swagger.config'; // must be first — calls extendZodWithOpenApi
import './super-admin.docs';
import './user.docs';
import './plan.docs';
import './subscription.docs';
import './rate-management.docs';
import './shipment.docs';
import './booking.docs';
import './country.docs';

import { generateSwaggerSpec } from '@config/swagger.config';

export const swaggerSpec: object = generateSwaggerSpec();
