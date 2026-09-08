import { Router } from "express";

import {
  activateOrganizerController,
  createHostedEventController,
  getOrganizerProfileController,
  listHostedEventsController,
  setHostedEventStatusController,
  updateHostedEventController,
  updateOrganizerProfileController,
  getHostedEventAudienceController,
  deleteHostedEventController,
} from "../controllers/organizer.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { requireOrganizer } from "../middleware/require-organizer.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateRequest } from "../middleware/validate-request.js";
import { createEventValidator } from "../validators/organizer-event.validator.js";

const organizerRouter = Router();
organizerRouter.use(requireAuth);
organizerRouter.get("/profile", asyncHandler(getOrganizerProfileController));
organizerRouter.post("/profile", asyncHandler(activateOrganizerController));
organizerRouter.post("/activate", asyncHandler(activateOrganizerController));
organizerRouter.put(
  "/profile",
  requireOrganizer,
  asyncHandler(updateOrganizerProfileController),
);
organizerRouter.get(
  "/events",
  requireOrganizer,
  asyncHandler(listHostedEventsController),
);
organizerRouter.post(
  "/events",
  requireOrganizer,
  validateRequest(createEventValidator),
  asyncHandler(createHostedEventController),
);
organizerRouter.patch(
  "/events/:eventId",
  requireOrganizer,
  asyncHandler(updateHostedEventController),
);
organizerRouter.patch(
  "/events/:eventId/status",
  requireOrganizer,
  asyncHandler(setHostedEventStatusController),
);
organizerRouter.get(
  "/events/:eventId/audience",
  requireOrganizer,
  asyncHandler(getHostedEventAudienceController),
);
organizerRouter.delete(
  "/events/:eventId",
  requireOrganizer,
  asyncHandler(deleteHostedEventController),
);

export { organizerRouter };
