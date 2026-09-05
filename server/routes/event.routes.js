import { Router } from "express";

import { updateEventPreferenceController } from "../controllers/event.controller.js";
import { createEventInvitationsController } from "../controllers/invitation.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const eventRouter = Router();
eventRouter.use(requireAuth);
eventRouter.post("/:eventId/invite", asyncHandler(createEventInvitationsController));
eventRouter.patch("/:eventId/:preference", asyncHandler(updateEventPreferenceController));

export { eventRouter };
