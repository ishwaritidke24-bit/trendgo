import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { createHttpError } from "../utils/http-error.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[env.authCookieName];
  if (!token) return next(createHttpError(401, "Authentication required", "AUTH_REQUIRED"));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = { userId: payload.sub };
    return next();
  } catch {
    return next(createHttpError(401, "Authentication required", "AUTH_INVALID"));
  }
}
