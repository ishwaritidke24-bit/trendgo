import { Router } from "express";

import {
  listInvitationsController,
  updateInvitationController,
} from "../controllers/invitation.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const invitationRouter = Router();
invitationRouter.use(requireAuth);
invitationRouter.get("/", asyncHandler(listInvitationsController));
invitationRouter.patch("/:invitationId", asyncHandler(updateInvitationController));

export { invitationRouter };
