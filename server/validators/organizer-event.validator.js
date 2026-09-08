export function createEventValidator({ body }) {
  const errors = [];
  const requiredFields = [
    "title",
    "description",
    "category",
    "date",
    "time",
    "venue",
    "city",
  ];
  // Check required fields presence and basic type
  for (const field of requiredFields) {
    if (!(field in body)) {
      errors.push({ field, message: `${field} is required` });
    } else if (typeof body[field] !== "string" || !body[field].trim()) {
      errors.push({ field, message: `${field} must be a non-empty string` });
    }
  }

  // Optional fields validation
  if (body.tags !== undefined) {
    if (
      !Array.isArray(body.tags) ||
      body.tags.some((t) => typeof t !== "string")
    ) {
      errors.push({
        field: "tags",
        message: "tags must be an array of strings",
      });
    }
  }
  if (
    body.image !== undefined &&
    body.image !== "" &&
    typeof body.image !== "string"
  ) {
    errors.push({ field: "image", message: "image must be a string URL" });
  }
  if (
    body.price !== undefined &&
    (typeof body.price !== "number" || body.price < 0)
  ) {
    errors.push({
      field: "price",
      message: "price must be a non-negative number",
    });
  }
  if (
    body.capacity !== undefined &&
    (typeof body.capacity !== "number" || body.capacity < 0)
  ) {
    errors.push({
      field: "capacity",
      message: "capacity must be a non-negative number",
    });
  }

  // Date format check (YYYY-MM-DD)
  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    errors.push({
      field: "date",
      message: "date must be in YYYY-MM-DD format",
    });
  }
  // Time format check (HH:MM)
  if (body.time && !/^\d{2}:\d{2}$/.test(body.time)) {
    errors.push({ field: "time", message: "time must be in HH:MM format" });
  }
  if (body.endTime && !/^\d{2}:\d{2}$/.test(body.endTime)) {
    errors.push({
      field: "endTime",
      message: "endTime must be in HH:MM format",
    });
  }
  if (body.endTime && body.time && body.endTime <= body.time) {
    errors.push({
      field: "endTime",
      message: "endTime must be after start time",
    });
  }

  return { valid: errors.length === 0, errors };
}
