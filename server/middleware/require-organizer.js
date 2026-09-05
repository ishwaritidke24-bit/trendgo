import { createHttpError } from "../utils/http-error.js";
import { User } from "../models/user.model.js";
import { OrganizerProfile } from "../models/organizer-profile.model.js";

export async function requireOrganizer(req, res, next) {
  try {
    const [user, profile] = await Promise.all([
      User.findById(req.auth.userId).select("roles organizerStatus organizerProfileId").lean(),
      OrganizerProfile.findOne({ userId: req.auth.userId }).select("_id").lean(),
    ]);
    if (
      !user?.roles?.includes("organizer") ||
      user.organizerStatus !== "active" ||
      !profile ||
      user.organizerProfileId?.toString() !== profile._id.toString()
    ) {
      return next(createHttpError(403, "Organizer access required", "ORGANIZER_REQUIRED"));
    }
    return next();
  } catch (error) {
    return next(error);
  }
}
