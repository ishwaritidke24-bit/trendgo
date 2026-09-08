const allowedQueryKeys = new Set();

export function healthQueryValidator({ query }) {
  const errors = Object.keys(query).filter((key) => !allowedQueryKeys.has(key));

  return {
    valid: errors.length === 0,
    errors: errors.map((key) => ({
      field: `query.${key}`,
      message: "Unknown query parameter",
    })),
  };
}
