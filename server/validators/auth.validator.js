const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function collectErrors({ name, email, password }) {
  const errors = [];

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)) {
    errors.push({ field: "name", message: "Name must be between 2 and 80 characters" });
  }
  if (email !== undefined && (typeof email !== "string" || !emailPattern.test(email.trim()))) {
    errors.push({ field: "email", message: "Enter a valid email address" });
  }
  if (password !== undefined && (typeof password !== "string" || password.length < 8 || password.length > 128)) {
    errors.push({ field: "password", message: "Password must be between 8 and 128 characters" });
  }

  return errors;
}

export function signupValidator({ body }) {
  const errors = collectErrors(body);
  for (const field of ["name", "email", "password"]) {
    if (!(field in body)) errors.push({ field, message: `${field} is required` });
  }
  return { valid: errors.length === 0, errors };
}

export function signinValidator({ body }) {
  const errors = collectErrors(body);
  for (const field of ["email", "password"]) {
    if (!(field in body)) errors.push({ field, message: `${field} is required` });
  }
  return { valid: errors.length === 0, errors };
}
