import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export function friendIdParamValidator({ params }) {
  const errors = [];
  const id = params?.friendId ?? params?.targetUserId ?? params?.userId;

  if (!id || !isValidObjectId(id)) {
    errors.push({
      field: "id",
      message: "Valid user ID is required",
    });
  }

  return { valid: errors.length === 0, errors };
}

export function requestIdParamValidator({ params }) {
  const errors = [];
  const id = params?.requestId;

  if (!id || !isValidObjectId(id)) {
    errors.push({
      field: "requestId",
      message: "Valid request ID is required",
    });
  }

  return { valid: errors.length === 0, errors };
}

export function searchUsersValidator({ query }) {
  const errors = [];
  const q = query?.q;

  if (q !== undefined && typeof q !== "string") {
    errors.push({
      field: "q",
      message: "Search query must be a string",
    });
  }

  return { valid: errors.length === 0, errors };
}
