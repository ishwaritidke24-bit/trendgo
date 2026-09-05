import mongoose from "mongoose";

const friendInvitationSchema = new mongoose.Schema(
  {
    inviterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    friendId: { type: String, required: true, trim: true },
    status: { type: String, enum: ["sent", "accepted", "declined"], default: "sent" },
  },
  { timestamps: true },
);

export const FriendInvitation =
  mongoose.models.FriendInvitation ?? mongoose.model("FriendInvitation", friendInvitationSchema);
