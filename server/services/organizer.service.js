import { OrganizerProfile } from "../models/organizer-profile.model.js";
import { User } from "../models/user.model.js";
import { createHttpError } from "../utils/http-error.js";

function publicOrganizer(profile) {
  if (!profile) return null;
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    displayName: profile.displayName,
    bio: profile.bio,
    organizationName: profile.organizationName,
    website: profile.website,
    verificationStatus: profile.verificationStatus,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function getOrganizerProfile(userId) {
  const profile = await OrganizerProfile.findOne({ userId }).lean();
  return publicOrganizer(profile);
}

export async function activateOrganizer(userId, input) {
  const user = await User.findById(userId).lean();
  if (!user) throw createHttpError(401, "Your session is no longer valid", "SESSION_INVALID");
  const profile = await OrganizerProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        displayName: input.displayName?.trim() || user.name,
        bio: input.bio?.trim() ?? "",
        organizationName: input.organizationName?.trim() ?? "",
        website: input.website?.trim() ?? "",
      },
      $setOnInsert: { userId, verificationStatus: "unverified" },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();
  await User.findByIdAndUpdate(userId, {
    $addToSet: { roles: "organizer" },
    $set: { organizerStatus: "active", organizerProfileId: profile._id },
  });
  return publicOrganizer(profile);
}

export async function updateOrganizerProfile(userId, input) {
  const updates = {};
  for (const field of ["displayName", "bio", "organizationName", "website"]) {
    if (input[field] !== undefined)
      updates[field] = typeof input[field] === "string" ? input[field].trim() : input[field];
  }
  const profile = await OrganizerProfile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!profile) throw createHttpError(404, "Organizer profile not found", "ORGANIZER_NOT_FOUND");
  return publicOrganizer(profile);
}
