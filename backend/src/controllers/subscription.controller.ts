import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '@services/subscription.service';
import { ApiResponse } from '@common/helpers/api-response.helper';
import type {
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  ListSubscriptionsQueryDTO,
} from '@common/dto/subscription.dto';

export async function listSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscriptions = await subscriptionService.listSubscriptions(
      req.query as ListSubscriptionsQueryDTO,
    );
    ApiResponse.success(res, subscriptions);
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await subscriptionService.getSubscription(req.params.id);
    ApiResponse.success(res, subscription);
  } catch (error) {
    next(error);
  }
}

export async function createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await subscriptionService.createSubscription(req.body as CreateSubscriptionDTO);
    ApiResponse.created(res, subscription);
  } catch (error) {
    next(error);
  }
}

export async function updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await subscriptionService.updateSubscription(
      req.params.id,
      req.body as UpdateSubscriptionDTO,
    );
    ApiResponse.success(res, subscription);
  } catch (error) {
    next(error);
  }
}

export async function deleteSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await subscriptionService.deleteSubscription(req.params.id);
    ApiResponse.success(res, subscription);
  } catch (error) {
    next(error);
  }
}
