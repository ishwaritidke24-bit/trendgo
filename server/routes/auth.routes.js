import { Router } from "express";

import {
  meController,
  signinController,
  signoutController,
  signupController,
  updateMeController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  signinValidator,
  signupValidator,
  updateProfileValidator,
} from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/signup", validateRequest(signupValidator), asyncHandler(signupController));
authRouter.post("/signin", validateRequest(signinValidator), asyncHandler(signinController));
authRouter.post("/signout", signoutController);
authRouter.get("/me", requireAuth, asyncHandler(meController));
authRouter.put(
  "/me",
  requireAuth,
  validateRequest(updateProfileValidator),
  asyncHandler(updateMeController),
);

export { authRouter };
