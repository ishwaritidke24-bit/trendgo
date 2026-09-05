import mongoose from "mongoose";

const friendInvitationSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, trim: true, maxlength: 240, default: "" },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true },
);

friendInvitationSchema.index(
  { eventId: 1, senderId: 1, recipientId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);

export const FriendInvitation =
  mongoose.models.FriendInvitation ?? mongoose.model("FriendInvitation", friendInvitationSchema);
