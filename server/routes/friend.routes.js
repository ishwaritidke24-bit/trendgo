import { Router } from "express";

import {
  listFriendsController,
  listFriendRequestsController,
  searchUsersController,
  getFriendSuggestionsController,
  sendFriendRequestController,
  acceptFriendRequestController,
  rejectFriendRequestController,
  cancelFriendRequestController,
  removeFriendController,
  getRelationshipStatusController,
  getFriendsActivityController,
} from "../controllers/friend.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  friendIdParamValidator,
  requestIdParamValidator,
  searchUsersValidator,
} from "../validators/friend.validator.js";

const friendRouter = Router();

friendRouter.use(requireAuth);

friendRouter.get("/", asyncHandler(listFriendsController));
friendRouter.get("/requests", asyncHandler(listFriendRequestsController));
friendRouter.get("/suggestions", asyncHandler(getFriendSuggestionsController));
friendRouter.get("/search", validateRequest(searchUsersValidator), asyncHandler(searchUsersController));
friendRouter.get("/activity", asyncHandler(getFriendsActivityController));
friendRouter.get("/status/:targetUserId", validateRequest(friendIdParamValidator), asyncHandler(getRelationshipStatusController));

friendRouter.post("/request/:targetUserId", validateRequest(friendIdParamValidator), asyncHandler(sendFriendRequestController));
friendRouter.post("/requests/:requestId/accept", validateRequest(requestIdParamValidator), asyncHandler(acceptFriendRequestController));
friendRouter.post("/requests/:requestId/reject", validateRequest(requestIdParamValidator), asyncHandler(rejectFriendRequestController));

friendRouter.delete("/requests/:requestId", validateRequest(requestIdParamValidator), asyncHandler(cancelFriendRequestController));
friendRouter.delete("/:friendId", validateRequest(friendIdParamValidator), asyncHandler(removeFriendController));

export { friendRouter };
