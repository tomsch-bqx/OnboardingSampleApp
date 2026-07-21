import React, { useState, useEffect } from 'react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'customer-info', label: 'Customer Info' },
  { id: 'data-mapping', label: 'Data Mapping' },
  { id: 'tenant-setup', label: 'Tenant Setup' },
  { id: 'import', label: 'Import' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetchOnboarding = () => {
    setLoading(true);
    return fetch('/api/onboarding')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid response format');
        return data;
      })
      .then((data) => {
        setOnboardingData(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch onboarding data:', err);
        setError(err.message);
        setOnboardingData([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    refetchOnboarding();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Onboarding Dashboard</h1>
        <p>Customer Success Team - Internal Tool</p>
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'dashboard' && (
          <DashboardTab data={onboardingData} loading={loading} error={error} />
        )}
        {activeTab === 'customer-info' && (
          <CustomerInfoTab onOnboardingUpdate={refetchOnboarding} />
        )}
        {activeTab === 'data-mapping' && (
          <PlaceholderTab
            title="Data Mapping"
            description="Map customer data to platform configuration"
          />
        )}
        {activeTab === 'tenant-setup' && (
          <PlaceholderTab
            title="Tenant Setup"
            description="Provision and configure customer tenant"
          />
        )}
        {activeTab === 'import' && (
          <PlaceholderTab title="Import" description="Import customer data into the platform" />
        )}
      </main>
    </div>
  );
}

function DashboardTab({ data, loading, error }) {
  if (loading) {
    return (
      <div className="placeholder">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="placeholder">
        <p style={{ color: '#dc2626' }}>⚠️ Failed to load onboarding data</p>
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="placeholder">
        <p>No customers in the onboarding queue</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Onboarding Queue</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        {data.length} customer(s) awaiting onboarding
      </p>

      {data.map((item) => (
        <div key={item.customerId} className="customer-card">
          <h3>{item.customerName}</h3>
          <div className="customer-meta">
            <span>📍 {item.customerRegion}</span>
            <span>🏭 {item.customerIndustry}</span>
          </div>

          <div className="progress-section">
            <ProgressBar percent={item.progressPercent} />
            <Checklist steps={item.steps} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${Math.max(percent, 0)}%` }}>
        {percent > 0 ? `${percent}%` : ''}
      </div>
    </div>
  );
}

function Checklist({ steps }) {
  return (
    <ul className="checklist">
      {steps.map((step) => (
        <li key={step.id}>
          <span className={`step-status ${step.status}`}>
            {step.status === 'completed' ? '✓' : step.order}
          </span>
          <span>{step.name}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#9ca3af' }}>
            {step.status.replace('_', ' ')}
          </span>
        </li>
      ))}
    </ul>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.contactEmail.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!EMAIL_REGEX.test(form.contactEmail)) {
    errors.contactEmail = 'Contact email must be a valid email address';
  }
  return errors;
}

function CustomerInfoTab({ onOnboardingUpdate }) {
  const [form, setForm] = useState({ name: '', industry: '', region: '', contactEmail: '' });
  const [existingCustomerId, setExistingCustomerId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((customers) => {
        if (customers.length > 0) {
          const customer = customers[0];
          setForm({
            name: customer.name || '',
            industry: customer.industry || '',
            region: customer.region || '',
            contactEmail: customer.contactEmail || ''
          });
          setExistingCustomerId(customer.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      const url = existingCustomerId ? `/api/customers/${existingCustomerId}` : '/api/customers';
      const method = existingCustomerId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setFieldErrors(data.errors || {});
        return;
      }

      setExistingCustomerId(data.customer.id);
      setFieldErrors({});
      setSubmitSuccess(true);
      onOnboardingUpdate();
    } catch (err) {
      console.error('Failed to save customer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="placeholder">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Customer Info</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Collect and validate customer information
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Name"
          value={form.name}
          error={fieldErrors.name}
          onChange={handleChange('name')}
        />
        <FormField
          label="Industry"
          value={form.industry}
          error={fieldErrors.industry}
          onChange={handleChange('industry')}
        />
        <FormField
          label="Region"
          value={form.region}
          error={fieldErrors.region}
          onChange={handleChange('region')}
        />
        <FormField
          label="Contact Email"
          value={form.contactEmail}
          error={fieldErrors.contactEmail}
          onChange={handleChange('contactEmail')}
        />

        <button type="submit" className="form-submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>

        {submitSuccess && <p className="form-success">✓ Customer info saved</p>}
      </form>
    </div>
  );
}

function FormField({ label, value, error, onChange }) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        className={`form-input ${error ? 'error' : ''}`}
        value={value}
        onChange={onChange}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function PlaceholderTab({ title, description }) {
  return (
    <div className="placeholder">
      <h2>{title}</h2>
      <p>{description}</p>
      <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>🚧 This section is ready to be built</p>
    </div>
  );
}

export default App;
