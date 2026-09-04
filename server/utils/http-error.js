export function createHttpError(statusCode, message, code = "HTTP_ERROR", details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}
