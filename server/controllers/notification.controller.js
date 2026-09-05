import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service.js";

export async function listNotificationsController(req, res) {
  const notifications = await listNotifications(req.auth.userId);
  const unreadCount = await countUnreadNotifications(req.auth.userId);
  res.json({ success: true, notifications, unreadCount });
}

export async function markNotificationReadController(req, res) {
  await markNotificationRead(req.auth.userId, req.params.notificationId);
  res.status(204).end();
}

export async function markAllNotificationsReadController(req, res) {
  await markAllNotificationsRead(req.auth.userId);
  res.status(204).end();
}
