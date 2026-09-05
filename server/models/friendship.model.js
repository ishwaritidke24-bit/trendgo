import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addresseeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true },
);

friendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true });

export const Friendship =
  mongoose.models.Friendship ?? mongoose.model("Friendship", friendshipSchema);
