import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    location: { type: String, trim: true, default: "" },
    interests: { type: [String], default: [] },
    savedEventIds: { type: [String], default: [] },
    interestedEventIds: { type: [String], default: [] },
    attendedEventIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
