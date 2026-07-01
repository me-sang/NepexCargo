import { z } from 'zod';

// ── List query ─────────────────────────────────────────────────────────────────

export const listCountriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  /** Matches against country name or ISO2 code. */
  search: z.string().trim().min(1).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ListCountriesQuery = z.infer<typeof listCountriesQuerySchema>;
