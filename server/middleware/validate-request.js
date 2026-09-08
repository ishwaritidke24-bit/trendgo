export function validateRequest(validator) {
  return (req, res, next) => {
    const result = validator({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.valid) {
      const error = new Error("Request validation failed");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = result.errors;
      return next(error);
    }

    return next();
  };
}
