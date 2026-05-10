import Stripe from 'stripe';
import { env } from '../../config/env.config';

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});
