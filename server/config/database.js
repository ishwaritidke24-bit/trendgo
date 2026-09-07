import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.error("MongoDB connection skipped: MONGODB_URI is missing or empty.");
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      dbName: "trendgo",
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (env.nodeEnv === "production") {
      process.exit(1);
    } else {
      console.warn("⚠️  Server started in offline/standalone mode. To connect database, whitelist your current IP in MongoDB Atlas: https://cloud.mongodb.com -> Network Access -> Add IP (or 0.0.0.0/0).");
    }
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
