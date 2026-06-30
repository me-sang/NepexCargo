import { Request, Response, NextFunction } from 'express';
import { Job } from 'bullmq';
import { ApiResponse } from '@common/helpers/api-response.helper';
import { ForbiddenException, BadRequestException, NotFoundException } from '@common/exceptions/app.exception';
import { exportZones, exportRates } from '@services/rate-import-export.service';
import { rateImportProducer } from '@queues/producers/rate-import.producer';
import { getQueue } from '@queues/queue.factory';
import { QUEUE_NAMES } from '@config/queue.config';

function tenantId(req: Request): string {
  const id = req.user?.tenantId;
  if (!id) throw new ForbiddenException('No tenant associated with this account');
  return id;
}

function resolveFormat(req: Request): 'csv' | 'xlsx' {
  const fmt = String(req.query.format ?? 'xlsx').toLowerCase();
  if (fmt !== 'csv' && fmt !== 'xlsx') throw new BadRequestException('format must be csv or xlsx');
  return fmt;
}

function sendFile(
  res: Response,
  result: { buffer: Buffer; contentType: string; extension: string },
  filename: string,
): void {
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.${result.extension}"`);
  res.send(result.buffer);
}

// ── Zone export/import ────────────────────────────────────────────────────────

export async function exportZonesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await exportZones(tenantId(req), resolveFormat(req));
    sendFile(res, result, 'zones');
  } catch (error) {
    next(error);
  }
}

export async function importZonesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) throw new BadRequestException('No file uploaded');
    const jobId = await rateImportProducer.enqueue({
      tenantId: tenantId(req),
      importType: 'zones',
      fileBase64: req.file.buffer.toString('base64'),
      mimetype: req.file.mimetype,
    });
    res.status(202).json({ success: true, data: { jobId, message: 'Zone import queued' } });
  } catch (error) {
    next(error);
  }
}

// ── Rate export/import ────────────────────────────────────────────────────────

export async function exportRatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await exportRates(tenantId(req), resolveFormat(req));
    sendFile(res, result, 'rates');
  } catch (error) {
    next(error);
  }
}

export async function importRatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) throw new BadRequestException('No file uploaded');
    const jobId = await rateImportProducer.enqueue({
      tenantId: tenantId(req),
      importType: 'rates',
      fileBase64: req.file.buffer.toString('base64'),
      mimetype: req.file.mimetype,
    });
    res.status(202).json({ success: true, data: { jobId, message: 'Rate import queued' } });
  } catch (error) {
    next(error);
  }
}

// ── Job status ────────────────────────────────────────────────────────────────

export async function importStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = await Job.fromId(getQueue(QUEUE_NAMES.RATE_IMPORT), jobId);
    if (!job) throw new NotFoundException('Import job');

    const state = await job.getState();
    const payload: Record<string, unknown> = { jobId, state };

    if (state === 'completed') payload.result = job.returnvalue;
    if (state === 'failed') payload.error = job.failedReason;

    ApiResponse.success(res, payload);
  } catch (error) {
    next(error);
  }
}
