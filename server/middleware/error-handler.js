export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code ?? "INTERNAL_SERVER_ERROR",
      message: isServerError ? "Internal server error" : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
}
