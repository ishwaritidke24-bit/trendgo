import { FriendInvitation } from "../models/friend-invitation.model.js";
import { Friendship } from "../models/friendship.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "./notification.service.js";
import { createHttpError } from "../utils/http-error.js";
import { EventParticipant } from "../models/event-participant.model.js";
import { Event } from "../models/event.model.js";

async function publicInvitation(invitation) {
  const eventRecord = await Event.findById(invitation.eventId).lean();
  const event = eventRecord
    ? {
        id: eventRecord._id.toString(),
        title: eventRecord.title,
        date: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(eventRecord.date),
        time: eventRecord.startTime,
        area: eventRecord.city,
      }
    : null;
  return {
    id: invitation._id.toString(),
    eventId: invitation.eventId,
    event,
    sender: invitation.senderId,
    recipient: invitation.recipientId,
    message: invitation.message,
    status: invitation.status,
    createdAt: invitation.createdAt,
  };
}

async function areFriends(userId, friendId) {
  return Friendship.exists({
    status: "accepted",
    $or: [
      { requesterId: userId, addresseeId: friendId },
      { requesterId: friendId, addresseeId: userId },
    ],
  });
}

export async function listFriends(userId) {
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requesterId: userId }, { addresseeId: userId }],
  }).lean();
  const ids = friendships.map((friendship) =>
    friendship.requesterId.toString() === userId.toString()
      ? friendship.addresseeId
      : friendship.requesterId,
  );
  const friends = await User.find({ _id: { $in: ids } })
    .select("name")
    .lean();
  return friends.map((friend) => ({
    id: friend._id.toString(),
    name: friend.name,
    initials: friend.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join(""),
    avatar: "",
    online: false,
  }));
}

export async function createEventInvitations(senderId, eventId, recipientIds, message = "") {
  const recipients = [...new Set(recipientIds)].filter(Boolean);
  if (!recipients.length) throw createHttpError(400, "Select at least one friend", "NO_RECIPIENTS");
  if (recipients.some((recipientId) => recipientId.toString() === senderId.toString())) {
    throw createHttpError(400, "You cannot invite yourself", "SELF_INVITE");
  }

  const validFriends = [];
  for (const recipientId of recipients) {
    if (!(await areFriends(senderId, recipientId))) {
      throw createHttpError(403, "You can only invite accepted friends", "NOT_FRIEND");
    }
    validFriends.push(recipientId);
  }

  const sender = await User.findById(senderId).select("name").lean();
  const invitations = [];
  for (const recipientId of validFriends) {
    const existing = await FriendInvitation.findOne({
      eventId,
      senderId,
      recipientId,
      status: "pending",
    }).lean();
    const invitation =
      existing ??
      (await FriendInvitation.create({
        eventId,
        senderId,
        recipientId,
        message,
        status: "pending",
      }));
    invitations.push(invitation);
    if (!existing) {
      await createNotification({
        userId: recipientId,
        type: "invitation",
        title: `${sender.name} invited you`,
        message: message || "Want to come along?",
        eventId,
        invitationId: invitation._id,
        senderId,
      });
    }
  }
  return Promise.all(invitations.map(publicInvitation));
}

export async function listInvitations(userId) {
  const invitations = await FriendInvitation.find({ recipientId: userId })
    .populate("senderId", "name")
    .populate("recipientId", "name")
    .sort({ createdAt: -1 })
    .lean();
  return Promise.all(invitations.map(publicInvitation));
}

export async function updateInvitation(userId, invitationId, status) {
  if (!["accepted", "declined"].includes(status)) {
    throw createHttpError(400, "Invalid invitation status", "INVALID_STATUS");
  }
  const invitation = await FriendInvitation.findOneAndUpdate(
    { _id: invitationId, recipientId: userId, status: "pending" },
    { $set: { status } },
    { returnDocument: "after" },
  ).lean();
  if (!invitation) throw createHttpError(404, "Invitation not found", "INVITATION_NOT_FOUND");

  if (status === "accepted") {
    await User.findByIdAndUpdate(userId, { $addToSet: { interestedEventIds: invitation.eventId } });
    await EventParticipant.bulkWrite([
      {
        updateOne: {
          filter: { eventId: invitation.eventId, userId: invitation.senderId },
          update: {
            $setOnInsert: {
              eventId: invitation.eventId,
              userId: invitation.senderId,
              source: "invitation",
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { eventId: invitation.eventId, userId },
          update: { $setOnInsert: { eventId: invitation.eventId, userId, source: "invitation" } },
          upsert: true,
        },
      },
    ]);
    await Event.findByIdAndUpdate(invitation.eventId, {
      $addToSet: { attendeeIds: userId, interestedIds: userId },
    });
    await createNotification({
      userId: invitation.senderId,
      type: "invitation_response",
      title: "Invitation accepted",
      message: "Your friend accepted the event invitation.",
      eventId: invitation.eventId,
      invitationId: invitation._id,
      senderId: userId,
    });
  }
  return publicInvitation(invitation);
}
