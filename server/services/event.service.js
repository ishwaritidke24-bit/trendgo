import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { createNotification } from "./notification.service.js";

const EVENT_FIELDS = { save: "savedEventIds", interest: "interestedEventIds" };

export async function updateEventPreference(userId, eventId, preference, enabled) {
  const field = EVENT_FIELDS[preference];
  if (!field) throw new Error("Unsupported event preference");

  const update = enabled ? { $addToSet: { [field]: eventId } } : { $pull: { [field]: eventId } };
  const user = await User.findByIdAndUpdate(userId, update, { returnDocument: "after" }).lean();
  if (!user) return null;

  if (enabled) {
    await createNotification({
      userId,
      type: preference,
      title: preference === "save" ? "Event saved" : "Interest updated",
      message:
        preference === "save"
          ? "The event is now in your saved events."
          : "Your interest was added to this event.",
      eventId,
    });
  }

  if (eventId.match(/^[a-f\d]{24}$/i)) {
    await Event.findByIdAndUpdate(
      eventId,
      enabled ? { $addToSet: { interestedIds: userId } } : { $pull: { interestedIds: userId } },
    );
  }

  return {
    savedEventIds: user.savedEventIds ?? [],
    interestedEventIds: user.interestedEventIds ?? [],
    attendedEventIds: user.attendedEventIds ?? [],
  };
}
