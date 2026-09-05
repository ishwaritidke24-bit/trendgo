import { Router } from "express";

import { listInterestsController } from "../controllers/interests.controller.js";

const interestsRouter = Router();

interestsRouter.get("/", listInterestsController);

export { interestsRouter };
