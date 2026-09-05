import mongoose from "mongoose";

const eventParticipantSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, enum: ["invitation", "direct"], default: "invitation" },
  },
  { timestamps: true },
);

eventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventParticipant =
  mongoose.models.EventParticipant ?? mongoose.model("EventParticipant", eventParticipantSchema);
