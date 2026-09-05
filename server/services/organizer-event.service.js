import { Event } from "../models/event.model.js";
import { createHttpError } from "../utils/http-error.js";

function publicEvent(event) {
  return {
    id: event._id.toString(),
    organizerId: event.organizerId.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    time: event.time,
    venue: event.venue,
    area: event.area,
    price: event.price,
    image: event.image,
    status: event.status,
    attendeeCount: event.attendeeIds?.length ?? 0,
    interestedCount: event.interestedIds?.length ?? 0,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export async function listHostedEvents(organizerId) {
  const events = await Event.find({ organizerId }).sort({ createdAt: -1 }).lean();
  return events.map(publicEvent);
}

export async function createHostedEvent(organizerId, input) {
  const event = await Event.create({ ...input, organizerId, status: "draft" });
  return publicEvent(event);
}

export async function updateHostedEvent(organizerId, eventId, input) {
  const updates = {};
  for (const field of [
    "title",
    "description",
    "category",
    "date",
    "time",
    "venue",
    "area",
    "price",
    "image",
  ]) {
    if (input[field] !== undefined) updates[field] = input[field];
  }
  const event = await Event.findOneAndUpdate(
    { _id: eventId, organizerId },
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!event) throw createHttpError(404, "Hosted event not found", "EVENT_NOT_FOUND");
  return publicEvent(event);
}

export async function setHostedEventStatus(organizerId, eventId, status) {
  if (!["draft", "published", "unpublished"].includes(status)) {
    throw createHttpError(400, "Invalid event status", "INVALID_EVENT_STATUS");
  }
  return updateHostedEvent(organizerId, eventId, { status });
}

export async function getHostedEventAudience(organizerId, eventId) {
  const event = await Event.findOne({ _id: eventId, organizerId })
    .populate("attendeeIds", "name email")
    .populate("interestedIds", "name email")
    .lean();
  if (!event) throw createHttpError(404, "Hosted event not found", "EVENT_NOT_FOUND");
  return {
    attendees: event.attendeeIds.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })),
    interested: event.interestedIds.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })),
  };
}
