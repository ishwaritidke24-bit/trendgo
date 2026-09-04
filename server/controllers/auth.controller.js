import {
  getAuthCookieClearOptions,
  getAuthCookieOptions,
  getCurrentUser,
  signin,
  signup,
} from "../services/auth.service.js";
import { env } from "../config/env.js";

export async function signupController(req, res) {
  const result = await signup(req.body);
  res.cookie(env.authCookieName, result.token, getAuthCookieOptions());
  res.status(201).json({ success: true, user: result.user });
}

export async function signinController(req, res) {
  const result = await signin(req.body);
  res.cookie(env.authCookieName, result.token, getAuthCookieOptions());
  res.status(200).json({ success: true, user: result.user });
}

export function signoutController(req, res) {
  res.clearCookie(env.authCookieName, getAuthCookieClearOptions());
  res.status(200).json({ success: true });
}

export async function meController(req, res) {
  const user = await getCurrentUser(req.auth.userId);
  res.status(200).json({ success: true, user });
}
