const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCustomer(data) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.contactEmail || !data.contactEmail.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!EMAIL_REGEX.test(data.contactEmail)) {
    errors.contactEmail = 'Contact email must be a valid email address';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateCustomer };
