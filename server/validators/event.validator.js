const editableFields = [
  "title",
  "description",
  "category",
  "tags",
  "image",
  "date",
  "startTime",
  "endTime",
  "venue",
  "address",
  "city",
  "latitude",
  "longitude",
  "price",
  "capacity",
  "status",
];

const statuses = new Set(["draft", "published", "cancelled"]);

function isRequestBody(body) {
  return body && typeof body === "object" && !Array.isArray(body);
}

function validateFields(body, required) {
  const errors = [];
  if (!isRequestBody(body)) return [{ field: "event", message: "Event data must be an object" }];
  const unsupported = Object.keys(body).filter((field) => !editableFields.includes(field));
  if (unsupported.length)
    errors.push({ field: "event", message: "Event contains unsupported fields" });
  for (const field of required) {
    if (!(field in body)) errors.push({ field, message: `${field} is required` });
  }
  const textLimits = {
    title: 160,
    description: 3000,
    category: 60,
    image: 2048,
    venue: 160,
    address: 240,
    city: 80,
  };
  for (const [field, maximum] of Object.entries(textLimits)) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" || body[field].trim().length > maximum)
    ) {
      errors.push({ field, message: `${field} must be text up to ${maximum} characters` });
    }
  }
  if (body.title !== undefined && body.title.trim().length < 3)
    errors.push({ field: "title", message: "title must be at least 3 characters" });
  if (
    body.date !== undefined &&
    (typeof body.date !== "string" || Number.isNaN(Date.parse(body.date)))
  )
    errors.push({ field: "date", message: "date must be a valid ISO date" });
  for (const field of ["startTime", "endTime"]) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" || !/^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(body[field]))
    )
      errors.push({ field, message: `${field} must be a valid time` });
  }
  if (
    body.tags !== undefined &&
    (!Array.isArray(body.tags) ||
      body.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.length > 50))
  )
    errors.push({ field: "tags", message: "tags must be a list of short text values" });
  for (const [field, minimum, maximum] of [
    ["latitude", -90, 90],
    ["longitude", -180, 180],
    ["price", 0, Number.MAX_SAFE_INTEGER],
    ["capacity", 0, Number.MAX_SAFE_INTEGER],
  ]) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "number" || body[field] < minimum || body[field] > maximum)
    )
      errors.push({ field, message: `${field} is invalid` });
  }
  if (body.status !== undefined && !statuses.has(body.status))
    errors.push({ field: "status", message: "status is invalid" });
  return errors;
}

export function createEventValidator({ body }) {
  const errors = validateFields(body, ["title", "category", "date", "startTime", "venue", "city"]);
  return { valid: errors.length === 0, errors };
}

export function updateEventValidator({ body }) {
  const errors = validateFields(body, []);
  if (isRequestBody(body) && !Object.keys(body).length)
    errors.push({ field: "event", message: "At least one event field is required" });
  return { valid: errors.length === 0, errors };
}
