import { Event } from "../models/event.model.js";
import { createHttpError } from "../utils/http-error.js";

function publicEvent(event) {
  return {
    id: event._id.toString(),
    organizerId: event.organizerId?.toString() ?? null,
    title: event.title,
    description: event.description,
    tags: event.tags ?? [],
    category: event.category,
    date:
      event.date instanceof Date
        ? event.date.toISOString().slice(0, 10)
        : event.date,
    time: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    area: event.city,
    address: event.address,
    city: event.city,
    price: event.price,
    capacity: event.capacity,
    image: event.image,
    status: event.status,
    attendeeCount: event.attendeeIds?.length ?? 0,
    interestedCount: event.interestedIds?.length ?? 0,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export async function listHostedEvents(organizerId) {
  const events = await Event.find({ organizerId })
    .sort({ createdAt: -1 })
    .lean();
  return events.map(publicEvent);
}

export async function createHostedEvent(organizerId, input) {
  const event = await Event.create({
    ...input,
    organizerId,
    startTime: input.startTime ?? input.time,
    city: input.city ?? input.area,
    status: "draft",
  });
  return publicEvent(event);
}

export async function updateHostedEvent(organizerId, eventId, input) {
  const updates = {};
  for (const field of [
    "title",
    "description",
    "category",
    "tags",
    "date",
    "startTime",
    "endTime",
    "venue",
    "address",
    "city",
    "price",
    "capacity",
    "image",
    "status",
  ]) {
    if (input[field] !== undefined) updates[field] = input[field];
  }
  if (input.time !== undefined) updates.startTime = input.time;
  if (input.area !== undefined) updates.city = input.area;
  const event = await Event.findOneAndUpdate(
    { _id: eventId, organizerId },
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!event)
    throw createHttpError(404, "Hosted event not found", "EVENT_NOT_FOUND");
  return publicEvent(event);
}

export async function setHostedEventStatus(organizerId, eventId, status) {
  if (!["draft", "published", "unpublished", "cancelled"].includes(status)) {
    throw createHttpError(400, "Invalid event status", "INVALID_EVENT_STATUS");
  }
  return updateHostedEvent(organizerId, eventId, { status });
}

export async function getHostedEventAudience(organizerId, eventId) {
  const event = await Event.findOne({ _id: eventId, organizerId })
    .populate("attendeeIds", "name email")
    .populate("interestedIds", "name email")
    .lean();
  if (!event)
    throw createHttpError(404, "Hosted event not found", "EVENT_NOT_FOUND");
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

export async function deleteHostedEvent(organizerId, eventId) {
  const result = await Event.deleteOne({ _id: eventId, organizerId });
  if (!result.deletedCount)
    throw createHttpError(404, "Hosted event not found", "EVENT_NOT_FOUND");
}
