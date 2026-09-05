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

const organizerRouter = Router();
organizerRouter.use(requireAuth);
organizerRouter.get("/profile", asyncHandler(getOrganizerProfileController));
organizerRouter.post("/activate", asyncHandler(activateOrganizerController));
organizerRouter.put("/profile", requireOrganizer, asyncHandler(updateOrganizerProfileController));
organizerRouter.get("/events", requireOrganizer, asyncHandler(listHostedEventsController));
organizerRouter.post("/events", requireOrganizer, asyncHandler(createHostedEventController));
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
organizerRouter.delete("/events/:eventId", requireOrganizer, asyncHandler(deleteHostedEventController));

export { organizerRouter };
