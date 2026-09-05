import { createHttpError } from "../utils/http-error.js";
import { User } from "../models/user.model.js";

export async function requireOrganizer(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).select("roles organizerStatus").lean();
    if (!user?.roles?.includes("organizer") || user.organizerStatus !== "active") {
      return next(createHttpError(403, "Organizer access required", "ORGANIZER_REQUIRED"));
    }
    return next();
  } catch (error) {
    return next(error);
  }
}
