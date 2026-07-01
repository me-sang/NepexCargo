import { z } from 'zod';
import { registry } from '@config/swagger.config';

const ErrorResponse = z.object({ success: z.literal(false), message: z.string() });

const CountrySchema = registry.register(
  'Country',
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    iso2: z.string().length(2),
  }),
);

registry.registerPath({
  method: 'get',
  path: '/countries',
  tags: ['Countries'],
  summary: 'List countries with search and filters',
  request: {
    query: z.object({
      page: z.coerce.number().int().positive().optional().describe('Default 1'),
      limit: z.coerce.number().int().positive().max(200).optional().describe('Default 50, max 200'),
      search: z.string().optional().describe('Matches against country name or ISO2 code'),
      isActive: z.coerce.boolean().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Paginated countries list',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(CountrySchema),
            meta: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
  },
});
