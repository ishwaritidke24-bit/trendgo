import mongoose from "mongoose";

import { INTEREST_CATEGORIES } from "../data/interests.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    location: { type: String, trim: true, default: "" },
    discoveryLocations: {
      type: [String],
      default: [],
      validate: [
        (arr) => arr.length <= 3,
        "Maximum 3 discovery locations allowed",
      ],
    },
    interests: { type: [String], enum: INTEREST_CATEGORIES, default: [] },
    avatar: { type: String, trim: true, default: "", maxlength: 2048 },
    onboardingCompleted: { type: Boolean, default: false },
    savedEventIds: { type: [String], default: [] },
    interestedEventIds: { type: [String], default: [] },
    attendedEventIds: { type: [String], default: [] },
    roles: {
      type: [String],
      enum: ["explorer", "organizer"],
      default: ["explorer"],
    },
    organizerStatus: {
      type: String,
      enum: ["not_started", "active"],
      default: "not_started",
    },
    organizerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerProfile",
      default: null,
    },
  },
  { timestamps: true },
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
