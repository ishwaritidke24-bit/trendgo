const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function collectErrors({ name, email, password }) {
  const errors = [];

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)
  ) {
    errors.push({ field: "name", message: "Name must be between 2 and 80 characters" });
  }
  if (email !== undefined && (typeof email !== "string" || !emailPattern.test(email.trim()))) {
    errors.push({ field: "email", message: "Enter a valid email address" });
  }
  if (
    password !== undefined &&
    (typeof password !== "string" || password.length < 8 || password.length > 128)
  ) {
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

export function updateProfileValidator({ body }) {
  const errors = [];
  const allowedFields = ["name", "location", "interests", "discoveryLocations"];

  if (!allowedFields.some((field) => field in body)) {
    errors.push({ field: "profile", message: "At least one profile field is required" });
  }
  if (
    body.name !== undefined &&
    (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 80)
  ) {
    errors.push({ field: "name", message: "Name must be between 2 and 80 characters" });
  }
  if (
    body.location !== undefined &&
    (typeof body.location !== "string" || body.location.length > 120)
  ) {
    errors.push({ field: "location", message: "Location must be 120 characters or fewer" });
  }
  if (
    body.interests !== undefined &&
    (!Array.isArray(body.interests) ||
      body.interests.some((interest) => typeof interest !== "string"))
  ) {
    errors.push({ field: "interests", message: "Interests must be a list of text values" });
  }
  if (
    body.discoveryLocations !== undefined &&
    (!Array.isArray(body.discoveryLocations) ||
      body.discoveryLocations.length > 3 ||
      body.discoveryLocations.some((loc) => typeof loc !== "string" || loc.length > 120))
  ) {
    errors.push({ field: "discoveryLocations", message: "Up to 3 valid location names required" });
  }
  return { valid: errors.length === 0, errors };
}
