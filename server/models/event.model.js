import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
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

    price: { type: Number, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    capacity: { type: Number, min: 0, default: 0 },

    image: { type: String, default: "" },

    // External URL where users can register / buy tickets
    ticketUrl: { type: String, default: "" },

    // "trendgo" for locally hosted events, external source name otherwise
    source: { type: String, trim: true, default: "trendgo" },
    // The event's ID on the external platform — used for deduplication
    sourceEventId: { type: String, trim: true, default: "", index: true },

    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
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
eventSchema.index({ city: 1, startDate: 1 });
// Compound index for fast deduplication lookups
eventSchema.index({ source: 1, sourceEventId: 1 }, { unique: false, sparse: true });

export const Event = mongoose.models.Event ?? mongoose.model("Event", eventSchema);
