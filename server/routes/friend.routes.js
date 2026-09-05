import { Router } from "express";

import { createFriendInvitationController } from "../controllers/friend.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const friendRouter = Router();
friendRouter.use(requireAuth);
friendRouter.post("/invitations", asyncHandler(createFriendInvitationController));

export { friendRouter };
