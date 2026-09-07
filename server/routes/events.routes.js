import { Router } from "express";

import { getEventController, listEventsController } from "../controllers/events.controller.js";
import { optionalAuth } from "../middleware/optional-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const eventsRouter = Router();
// Optional auth so we can personalize ranking for logged-in users
eventsRouter.get("/", asyncHandler(optionalAuth), asyncHandler(listEventsController));
eventsRouter.get("/:eventId", asyncHandler(optionalAuth), asyncHandler(getEventController));

export { eventsRouter };
