import { Router } from "express";

import { getEventController, listEventsController } from "../controllers/events.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const eventsRouter = Router();
eventsRouter.get("/", asyncHandler(listEventsController));
eventsRouter.get("/:eventId", asyncHandler(getEventController));

export { eventsRouter };
