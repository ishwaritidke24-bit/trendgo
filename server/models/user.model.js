import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    location: { type: String, trim: true, default: "" },
    // Up to 3 discovery locations for real-time event aggregation
    discoveryLocations: { type: [String], default: [], validate: [(arr) => arr.length <= 3, "Maximum 3 discovery locations allowed"] },
    interests: { type: [String], default: [] },
    savedEventIds: { type: [String], default: [] },
    interestedEventIds: { type: [String], default: [] },
    attendedEventIds: { type: [String], default: [] },
    roles: { type: [String], enum: ["explorer", "organizer"], default: ["explorer"] },
    organizerStatus: { type: String, enum: ["not_started", "active"], default: "not_started" },
    organizerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerProfile",
      default: null,
    },
  },
  { timestamps: true },
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
