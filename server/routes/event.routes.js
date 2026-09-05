import { Router } from "express";

import {
  inviteToEventController,
  updateEventPreferenceController,
} from "../controllers/event.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const eventRouter = Router();
eventRouter.use(requireAuth);
eventRouter.patch("/:eventId/:preference", asyncHandler(updateEventPreferenceController));
eventRouter.post("/:eventId/invitations", asyncHandler(inviteToEventController));

export { eventRouter };
