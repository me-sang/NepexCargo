import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestException } from '../exceptions/app.exception';

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new BadRequestException('Validation failed', result.error.flatten()));
    }
    req[target] = result.data;
    next();
  };
}
