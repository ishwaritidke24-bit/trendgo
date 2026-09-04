import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(env.clientOrigins);

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.json({ success: true, service: "trendgo-api" });
  });
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
