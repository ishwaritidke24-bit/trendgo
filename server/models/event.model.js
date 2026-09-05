import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    blurb: { type: String, trim: true, maxlength: 240, default: "TrendGo host" },
    initials: { type: String, trim: true, maxlength: 8, default: "TG" },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    // Organizer (local events created via TrendGo — null for external aggregated events)
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    tags: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },

    // Date/time stored as ISO strings for easy querying
    startDate: { type: Date, index: true },
    endDate: { type: Date },

    // Human-readable fallbacks (kept for compatibility with existing UI)
    date: { type: String, trim: true, default: "" },
    time: { type: String, trim: true, default: "" },
    endTime: { type: String, trim: true, default: "" },

    venue: { type: String, trim: true, default: "" },
    area: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "", index: true },

    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

=======
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, default: null },
    organizer: {
      type: organizerSchema,
      default: () => ({ name: "TrendGo host", blurb: "Local experiences", initials: "TG" }),
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    tags: { type: [{ type: String, trim: true, maxlength: 50 }], default: [] },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    image: { type: String, trim: true, default: "", maxlength: 2048 },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true, trim: true, maxlength: 10 },
    endTime: { type: String, trim: true, default: "" },
    venue: { type: String, required: true, trim: true },
    area: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true, maxlength: 80, index: true },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
>>>>>>> fda1311 (changes to organizer profile)
    price: { type: Number, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    capacity: { type: Number, min: 0, default: 0 },
<<<<<<< HEAD

    image: { type: String, default: "" },

    // External URL where users can register / buy tickets
    ticketUrl: { type: String, default: "" },

    // "trendgo" for locally hosted events, external source name otherwise
    source: { type: String, trim: true, default: "trendgo" },
    // The event's ID on the external platform — used for deduplication
    sourceEventId: { type: String, trim: true, default: "", index: true },

=======
>>>>>>> fda1311 (changes to organizer profile)
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "unpublished"],
      default: "published",
      index: true,
    },

    attendeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    interestedIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    interested: { type: Number, default: 0 },

    // Cache expiry — aggregated events are refreshed after this date
    cacheExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

eventSchema.index({ organizerId: 1, createdAt: -1 });
<<<<<<< HEAD
eventSchema.index({ city: 1, startDate: 1 });
// Compound index for fast deduplication lookups
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ source: 1, sourceEventId: 1 }, { unique: false, sparse: true });
=======
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ city: 1, category: 1, date: 1 });
>>>>>>> fda1311 (changes to organizer profile)

export const Event = mongoose.models.Event ?? mongoose.model("Event", eventSchema);
