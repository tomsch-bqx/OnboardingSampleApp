const VALID_PLANS = ['starter', 'professional', 'enterprise'];
const VALID_STATUSES = ['pending', 'provisioning', 'active', 'failed'];

function validateTenant(data, { requirePlan = true } = {}) {
  const errors = {};

  if (data.plan === undefined) {
    if (requirePlan) {
      errors.plan = 'Plan is required';
    }
  } else if (!data.plan || !data.plan.trim()) {
    errors.plan = 'Plan is required';
  } else if (!VALID_PLANS.includes(data.plan)) {
    errors.plan = `Plan must be one of: ${VALID_PLANS.join(', ')}`;
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateTenant, VALID_PLANS, VALID_STATUSES };
