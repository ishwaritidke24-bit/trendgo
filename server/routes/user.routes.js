import { Router } from "express";

import {
  getMeController,
  updateMeController,
  updateMyInterestsController,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  updateInterestsValidator,
  updateProfileValidator,
} from "../validators/auth.validator.js";

const userRouter = Router();

userRouter.get("/me", requireAuth, asyncHandler(getMeController));
userRouter.put(
  "/me/interests",
  requireAuth,
  validateRequest(updateInterestsValidator),
  asyncHandler(updateMyInterestsController),
);
userRouter.put(
  "/me",
  requireAuth,
  validateRequest(updateProfileValidator),
  asyncHandler(updateMeController),
);

export { userRouter };
