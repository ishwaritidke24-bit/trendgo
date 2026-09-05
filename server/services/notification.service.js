import { Notification } from "../models/notification.model.js";

function toPublicNotification(notification) {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    eventId: notification.eventId,
    read: Boolean(notification.readAt),
    createdAt: notification.createdAt,
  };
}

export async function listNotifications(userId) {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return notifications.map(toPublicNotification);
}

export async function countUnreadNotifications(userId) {
  return Notification.countDocuments({ userId, readAt: null });
}

export async function markNotificationRead(userId, notificationId) {
  await Notification.updateOne({ _id: notificationId, userId }, { $set: { readAt: new Date() } });
}

export async function markAllNotificationsRead(userId) {
  await Notification.updateMany({ userId, readAt: null }, { $set: { readAt: new Date() } });
}

export async function createNotification(input) {
  return Notification.create(input);
}
