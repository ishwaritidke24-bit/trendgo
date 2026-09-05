import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { friendRouter } from "./routes/friend.routes.js";
import { invitationRouter } from "./routes/invitation.routes.js";
import { organizerRouter } from "./routes/organizer.routes.js";
import { interestsRouter } from "./routes/interests.routes.js";
import { userRouter } from "./routes/user.routes.js";

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(env.clientOrigins);

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        // Reflect the request origin, or fallback to true if no origin (e.g. non-browser requests)
        // This is safe for development and allows Lovable preview domains to work
        callback(null, origin || true);
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
  app.use("/api/interests", interestsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/events", eventRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/friends", friendRouter);
  app.use("/api/invitations", invitationRouter);
  app.use("/api/organizer", organizerRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
