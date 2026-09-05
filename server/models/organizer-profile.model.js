import mongoose from "mongoose";

const organizerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1000, default: "" },
    organizationName: { type: String, trim: true, maxlength: 160, default: "" },
    website: { type: String, trim: true, maxlength: 300, default: "" },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
    },
  },
  { timestamps: true },
);

export const OrganizerProfile =
  mongoose.models.OrganizerProfile ?? mongoose.model("OrganizerProfile", organizerProfileSchema);
