import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { createHttpError } from "../utils/http-error.js";
import { toPublicUser } from "../utils/user-response.js";

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function issueToken(userId) {
  return jwt.sign({ sub: userId.toString() }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.authCookieMaxAgeMs,
    path: "/",
  };
}

export function getAuthCookieClearOptions() {
  const { maxAge, ...options } = getAuthCookieOptions();
  return options;
}

export async function signup({
  name,
  email,
  password,
  location = "",
  interests = [],
  avatar = "",
}) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser)
    throw createHttpError(409, "An account with that email already exists", "EMAIL_IN_USE");

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    location,
    interests,
    avatar,
  });
  return { user: toPublicUser(user), token: issueToken(user._id) };
}

export async function signin({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash");
  const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!validPassword)
    throw createHttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");

  return { user: toPublicUser(user), token: issueToken(user._id) };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw createHttpError(401, "Your session is no longer valid", "SESSION_INVALID");
  return toPublicUser(user);
}

export async function updateCurrentUser(userId, input) {
  const updates = {};

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.location !== undefined) updates.location = input.location.trim();
  if (input.interests !== undefined) updates.interests = input.interests;
  if (input.avatar !== undefined) updates.avatar = input.avatar.trim();

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).lean();
  if (!user) throw createHttpError(401, "Your session is no longer valid", "SESSION_INVALID");
  return toPublicUser(user);
}
