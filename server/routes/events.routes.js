import { Router } from "express";

<<<<<<< HEAD
import { getEventController, listEventsController } from "../controllers/events.controller.js";
import { optionalAuth } from "../middleware/optional-auth.js";
=======
import {
  createEventController,
  deleteEventController,
  getEventController,
  listEventsController,
  updateEventController,
} from "../controllers/events.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateRequest } from "../middleware/validate-request.js";
>>>>>>> fda1311 (changes to organizer profile)
import { asyncHandler } from "../utils/async-handler.js";
import { createEventValidator, updateEventValidator } from "../validators/event.validator.js";

const eventsRouter = Router();
<<<<<<< HEAD
// Optional auth so we can personalize ranking for logged-in users
eventsRouter.get("/", asyncHandler(optionalAuth), asyncHandler(listEventsController));
eventsRouter.get("/:eventId", asyncHandler(optionalAuth), asyncHandler(getEventController));
=======

eventsRouter.get("/", asyncHandler(listEventsController));
eventsRouter.post("/", requireAuth, validateRequest(createEventValidator), asyncHandler(createEventController));
eventsRouter.post(
  "/",
  requireAuth,
  validateRequest(createEventValidator),
  asyncHandler(createEventController),
);
eventsRouter.get("/:eventId", asyncHandler(getEventController));
eventsRouter.put(
  "/:eventId",
  requireAuth,
  validateRequest(updateEventValidator),
  asyncHandler(updateEventController),
);
eventsRouter.delete("/:eventId", requireAuth, asyncHandler(deleteEventController));
>>>>>>> fda1311 (changes to organizer profile)

export { eventsRouter };
