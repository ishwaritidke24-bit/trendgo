import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, required: true, default: "system" },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    eventId: { type: String, default: "" },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FriendInvitation",
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ??
  mongoose.model("Notification", notificationSchema);
