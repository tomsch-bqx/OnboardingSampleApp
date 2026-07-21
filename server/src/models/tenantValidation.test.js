const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validateTenant } = require('./tenantValidation');

describe('validateTenant', () => {
  it('should be valid with a supported plan', () => {
    const result = validateTenant({ plan: 'professional' });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, {});
  });

  it('should require a plan by default', () => {
    const result = validateTenant({});
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.plan);
  });

  it('should reject an invalid plan', () => {
    const result = validateTenant({ plan: 'ultimate' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.plan);
  });

  it('should reject an invalid status', () => {
    const result = validateTenant({ plan: 'starter', status: 'archived' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.status);
  });

  it('should accept a valid status alongside a valid plan', () => {
    const result = validateTenant({ plan: 'starter', status: 'active' });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, {});
  });

  it('should not require a plan when requirePlan is false', () => {
    const result = validateTenant({ status: 'active' }, { requirePlan: false });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, {});
  });
});
