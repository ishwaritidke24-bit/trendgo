/**
 * Optional authentication middleware.
 * If a valid auth cookie is present, attaches req.auth and loads req.user from DB.
 * If no cookie or invalid token, continues without setting req.user (guest mode).
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";

export async function optionalAuth(req, res, next) {
  const token = req.cookies?.[env.authCookieName];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = { userId: payload.sub };
    // Load user so we can use interests/locations in ranking
    const user = await User.findById(payload.sub).lean();
    if (user) req.user = user;
  } catch {
    // Invalid token — just continue as guest
  }
  return next();
}
