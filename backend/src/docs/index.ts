import '@config/swagger.config'; // must be first — calls extendZodWithOpenApi
import './super-admin.docs';
import './user.docs';

import { generateSwaggerSpec } from '@config/swagger.config';

export const swaggerSpec: object = generateSwaggerSpec();
