import { areValidInterests } from "../data/interests.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isRequestBody = (body) => body && typeof body === "object" && !Array.isArray(body);

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
  const allowedFields = ["name", "email", "location", "avatar", "interests", "discoveryLocations"];

  if (!isRequestBody(body)) {
    return {
      valid: false,
      errors: [{ field: "profile", message: "Profile updates must be an object" }],
    };
  }
  const unsupportedFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unsupportedFields.length) {
    errors.push({ field: "profile", message: "Profile contains unsupported fields" });
  }
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
    body.email !== undefined &&
    (typeof body.email !== "string" || !emailPattern.test(body.email.trim()))
  ) {
    errors.push({ field: "email", message: "Enter a valid email address" });
  }
  if (
    body.location !== undefined &&
    (typeof body.location !== "string" || body.location.length > 120)
  ) {
    errors.push({ field: "location", message: "Location must be 120 characters or fewer" });
  }
  if (body.avatar !== undefined && (typeof body.avatar !== "string" || body.avatar.length > 2048)) {
    errors.push({ field: "avatar", message: "Avatar must be a URL of 2,048 characters or fewer" });
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

export function updateInterestsValidator({ body }) {
  const errors = [];

  if (!isRequestBody(body)) {
    return {
      valid: false,
      errors: [{ field: "interests", message: "Interests must be provided as an object field" }],
    };
  }
  if (Object.keys(body).some((field) => field !== "interests")) {
    errors.push({ field: "interests", message: "Only interests can be updated here" });
  }
  if (!("interests" in body)) {
    errors.push({ field: "interests", message: "Interests are required" });
  } else if (!areValidInterests(body.interests)) {
    errors.push({
      field: "interests",
      message: "Interests must be unique values from the TrendGo interest categories",
    });
  }

  return { valid: errors.length === 0, errors };
}
