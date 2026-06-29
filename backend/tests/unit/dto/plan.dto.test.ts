// Import after file exists — tests will fail until Step 3
import { createPlanSchema, updatePlanSchema } from '@common/dto/plan.dto';

const validBase = {
  code: 'starter',
  name: 'Starter Plan',
  billingOptions: [{ billingCycle: 'monthly', price: 29.99, currency: 'USD' }],
};

describe('createPlanSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = createPlanSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(true);
      expect(result.data.isActive).toBe(true);
      expect(result.data.sortOrder).toBe(0);
      expect(result.data.features).toEqual([]);
    }
  });

  it('accepts a full payload with features', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      description: 'For small teams',
      isPublic: false,
      isActive: true,
      sortOrder: 2,
      features: [
        { featureKey: 'max_users', featureType: 'number', featureValue: 10 },
        { featureKey: 'custom_domain', featureType: 'boolean', featureValue: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a code with uppercase letters', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: 'Starter' });
    expect(result.success).toBe(false);
  });

  it('rejects a code with spaces', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: 'my plan' });
    expect(result.success).toBe(false);
  });

  it('rejects empty code', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: '' });
    expect(result.success).toBe(false);
  });

  it('rejects code longer than 50 chars', () => {
    const result = createPlanSchema.safeParse({ ...validBase, code: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createPlanSchema.safeParse({ ...validBase, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing billingOptions', () => {
    const { billingOptions: _, ...rest } = validBase;
    const result = createPlanSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty billingOptions array', () => {
    const result = createPlanSchema.safeParse({ ...validBase, billingOptions: [] });
    expect(result.success).toBe(false);
  });

  it('rejects billingOption with price = 0', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'monthly', price: 0, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects billingOption with negative price', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'monthly', price: -5, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects billingOption currency not 3 chars', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'monthly', price: 10, currency: 'US' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid billingCycle', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      billingOptions: [{ billingCycle: 'weekly', price: 10, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid featureType', () => {
    const result = createPlanSchema.safeParse({
      ...validBase,
      features: [{ featureKey: 'x', featureType: 'date', featureValue: true }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects sortOrder below 0', () => {
    const result = createPlanSchema.safeParse({ ...validBase, sortOrder: -1 });
    expect(result.success).toBe(false);
  });
});

describe('updatePlanSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = updatePlanSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with only name', () => {
    const result = updatePlanSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('still rejects invalid code format when code is provided', () => {
    const result = updatePlanSchema.safeParse({ code: 'BAD CODE' });
    expect(result.success).toBe(false);
  });

  it('still rejects price <= 0 when billingOptions is provided', () => {
    const result = updatePlanSchema.safeParse({
      billingOptions: [{ billingCycle: 'monthly', price: 0, currency: 'USD' }],
    });
    expect(result.success).toBe(false);
  });
});
