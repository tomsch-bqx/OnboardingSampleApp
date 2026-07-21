const express = require('express');
const cors = require('cors');
const store = require('./data/store');
const { validateCustomer } = require('./models/validation');
const { validateTenant } = require('./models/tenantValidation');
const {
  createCustomer,
  createTenant,
  createDefaultOnboardingSteps,
  calculateProgress
} = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all customers
app.get('/api/customers', (req, res) => {
  res.json(store.getCustomers());
});

// Get customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customer = store.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Get onboarding state for a customer
app.get('/api/customers/:id/onboarding', (req, res) => {
  const state = store.getOnboardingState(req.params.id);
  if (!state) {
    return res.status(404).json({ error: 'Onboarding state not found' });
  }
  res.json(state);
});

// Get all onboarding states (dashboard view)
app.get('/api/onboarding', (req, res) => {
  const states = store.getAllOnboardingStates();
  const customers = store.getCustomers();

  // Join customer info with onboarding state
  const dashboard = states.map((state) => {
    const customer = customers.find((c) => c.id === state.customerId);
    return {
      ...state,
      customerName: customer?.name || 'Unknown',
      customerIndustry: customer?.industry || '',
      customerRegion: customer?.region || ''
    };
  });

  res.json(dashboard);
});

// Create a new customer
app.post('/api/customers', (req, res) => {
  const { valid, errors } = validateCustomer(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const customer = store.addCustomer(createCustomer(req.body));

  const steps = createDefaultOnboardingSteps();
  steps[0].status = 'completed';
  const onboardingState = store.addOnboardingState({
    customerId: customer.id,
    steps,
    progressPercent: calculateProgress(steps)
  });

  res.status(201).json({ customer, onboardingState });
});

// Update an existing customer
app.put('/api/customers/:id', (req, res) => {
  const existing = store.getCustomerById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const { valid, errors } = validateCustomer(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const customer = store.updateCustomer(req.params.id, req.body);

  let onboardingState = store.getOnboardingState(req.params.id);
  if (onboardingState) {
    const steps = onboardingState.steps.map((step) =>
      step.id === 'step_1' ? { ...step, status: 'completed' } : step
    );
    onboardingState = store.updateOnboardingState(req.params.id, {
      steps,
      progressPercent: calculateProgress(steps)
    });
  }

  res.json({ customer, onboardingState });
});

// Get tenant by customer ID
app.get('/api/tenants/:customerId', (req, res) => {
  const tenant = store.getTenantByCustomerId(req.params.customerId);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  res.json(tenant);
});

// Create a new tenant
app.post('/api/tenants', (req, res) => {
  const { customerId } = req.body;
  const customer = store.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const { valid, errors } = validateTenant(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  if (store.getTenantByCustomerId(customerId)) {
    return res.status(409).json({ error: 'Tenant already exists for this customer' });
  }

  const tenant = store.addTenant(
    createTenant({ customerId, plan: req.body.plan, status: 'provisioning' })
  );

  let onboardingState = store.getOnboardingState(customerId);
  if (onboardingState) {
    const steps = onboardingState.steps.map((step) =>
      step.id === 'step_3' ? { ...step, status: 'completed' } : step
    );
    onboardingState = store.updateOnboardingState(customerId, {
      steps,
      progressPercent: calculateProgress(steps)
    });
  }

  res.status(201).json({ tenant, onboardingState });
});

// Update an existing tenant
app.put('/api/tenants/:customerId', (req, res) => {
  const existing = store.getTenantByCustomerId(req.params.customerId);
  if (!existing) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  const { valid, errors } = validateTenant(req.body, { requirePlan: false });
  if (!valid) {
    return res.status(400).json({ errors });
  }

  const tenant = store.updateTenant(req.params.customerId, req.body);

  let onboardingState = store.getOnboardingState(req.params.customerId);
  if (onboardingState) {
    const steps = onboardingState.steps.map((step) =>
      step.id === 'step_3' ? { ...step, status: 'completed' } : step
    );
    onboardingState = store.updateOnboardingState(req.params.customerId, {
      steps,
      progressPercent: calculateProgress(steps)
    });
  }

  res.json({ tenant, onboardingState });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Onboarding API server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
