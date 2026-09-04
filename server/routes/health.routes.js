import { Router } from "express";

import { getHealth } from "../controllers/health.controller.js";
import { validateRequest } from "../middleware/validate-request.js";
import { healthQueryValidator } from "../validators/health.validator.js";

const healthRouter = Router();

healthRouter.get("/", validateRequest(healthQueryValidator), getHealth);

export { healthRouter };
