import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.error("MongoDB connection skipped: MONGODB_URI is missing or empty.");
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed. Please ensure your MongoDB URI is correct and the server is running.");
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
