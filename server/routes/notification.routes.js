import { Router } from "express";

import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.get("/", asyncHandler(listNotificationsController));
notificationRouter.patch("/:notificationId/read", asyncHandler(markNotificationReadController));
notificationRouter.patch("/read-all", asyncHandler(markAllNotificationsReadController));

export { notificationRouter };
