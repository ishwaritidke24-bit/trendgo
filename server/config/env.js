import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env"), override: true });

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const parsePort = (value) => {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT ?? "5000"),
  mongoUri: process.env.MONGODB_URI ?? "",
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "trendgo_token",
  authCookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  clientOrigins: required("CLIENT_ORIGIN")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  // External event API keys — optional (graceful fallback when not set)
  ticketmasterApiKey: process.env.TICKETMASTER_API_KEY ?? "",
  serpApiKey: process.env.SERPAPI_API_KEY ?? "",
});
