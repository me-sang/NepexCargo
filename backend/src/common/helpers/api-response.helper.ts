import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const ApiResponse = {
  success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data });
  },

  created<T>(res: Response, data: T) {
    return ApiResponse.success(res, data, 201);
  },

  paginated<T>(res: Response, data: T[], meta: PaginationMeta) {
    return res.status(200).json({ success: true, data, meta });
  },

  noContent(res: Response) {
    return res.status(204).send();
  },

  error(res: Response, message: string, statusCode = 400, errors?: unknown) {
    return res.status(statusCode).json({ success: false, message, errors });
  },
};
