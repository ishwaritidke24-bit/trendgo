import { Router } from "express";

import {
  createEventController,
  deleteEventController,
  getEventController,
  listEventsController,
  updateEventController,
} from "../controllers/events.controller.js";
import { optionalAuth } from "../middleware/optional-auth.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createEventValidator, updateEventValidator } from "../validators/event.validator.js";

const eventsRouter = Router();

// Optional auth so we can personalize ranking for logged-in users
eventsRouter.get("/", asyncHandler(optionalAuth), asyncHandler(listEventsController));
eventsRouter.post(
  "/",
  requireAuth,
  validateRequest(createEventValidator),
  asyncHandler(createEventController),
);
eventsRouter.get("/:eventId", asyncHandler(optionalAuth), asyncHandler(getEventController));
eventsRouter.put(
  "/:eventId",
  requireAuth,
  validateRequest(updateEventValidator),
  asyncHandler(updateEventController),
);
eventsRouter.delete("/:eventId", requireAuth, asyncHandler(deleteEventController));

export { eventsRouter };
