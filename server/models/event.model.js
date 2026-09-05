import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    tags: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    endTime: { type: String, trim: true, default: "" },
    venue: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    price: { type: Number, min: 0, default: 0 },
    capacity: { type: Number, min: 0, default: 0 },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
      index: true,
    },
    attendeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    interestedIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

eventSchema.index({ organizerId: 1, createdAt: -1 });

export const Event = mongoose.models.Event ?? mongoose.model("Event", eventSchema);
