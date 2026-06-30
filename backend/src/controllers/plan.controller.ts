import { Request, Response, NextFunction } from 'express';
import { planService } from '@services/plan.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import type { CreatePlanDTO, UpdatePlanDTO } from '@common/dto/plan.dto';

export async function listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await planService.listPlans();
    ApiResponse.success(res, plans);
  } catch (error) {
    next(error);
  }
}

export async function getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.getPlan(req.params.id);
    ApiResponse.success(res, plan);
  } catch (error) {
    next(error);
  }
}

export async function createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.createPlan(req.body as CreatePlanDTO);
    ApiResponse.created(res, plan);
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.updatePlan(req.params.id, req.body as UpdatePlanDTO);
    ApiResponse.success(res, plan);
  } catch (error) {
    next(error);
  }
}

export async function deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await planService.deletePlan(req.params.id);
    ApiResponse.success(res, plan);
  } catch (error) {
    next(error);
  }
}
