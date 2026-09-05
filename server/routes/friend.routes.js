import { Router } from "express";

import { listFriendsController } from "../controllers/friend.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const friendRouter = Router();
friendRouter.use(requireAuth);
friendRouter.get("/", asyncHandler(listFriendsController));

export { friendRouter };
