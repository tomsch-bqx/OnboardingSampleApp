const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validateCustomer } = require('./validation');

describe('validateCustomer', () => {
  it('should be valid with a name and a properly formatted email', () => {
    const result = validateCustomer({ name: 'Acme Corp', contactEmail: 'acme@example.com' });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, {});
  });

  it('should require a name', () => {
    const result = validateCustomer({ name: '', contactEmail: 'acme@example.com' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.name);
  });

  it('should require a contact email', () => {
    const result = validateCustomer({ name: 'Acme Corp', contactEmail: '' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.contactEmail);
  });

  it('should reject an invalid email format', () => {
    const result = validateCustomer({ name: 'Acme Corp', contactEmail: 'not-an-email' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.contactEmail);
  });

  it('should report both errors when name and email are missing', () => {
    const result = validateCustomer({ name: '', contactEmail: '' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.name);
    assert.ok(result.errors.contactEmail);
  });
});
