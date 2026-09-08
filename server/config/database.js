import mongoose from "mongoose";

import { env } from "./env.js";

let isConnecting = false;

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.error("MongoDB connection skipped: MONGODB_URI is missing or empty.");
    console.warn("MongoDB connection skipped: MONGODB_URI is missing or empty.");
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      dbName: "trendgo",
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
    console.log(`✅ MongoDB connected (database: ${mongoose.connection.name})`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (env.nodeEnv === "production") {
      process.exit(1);
    } else {
      console.warn("⚠️  Server started in offline/standalone mode. To connect database, whitelist your current IP in MongoDB Atlas: https://cloud.mongodb.com -> Network Access -> Add IP (or 0.0.0.0/0).");
      console.warn("⚠️  Server started in offline/in-memory mode (events are served from local catalog).");
      console.warn("👉 To connect MongoDB Atlas:");
      console.warn("   1. Open: https://cloud.mongodb.com");
      console.warn("   2. Go to: Security -> Network Access -> Add IP Address");
      console.warn("   3. Select: 'Allow Access from Anywhere' (0.0.0.0/0) or add your current IP (103.184.154.190)");
      console.warn("   4. Save and wait ~30s. The server will auto-reconnect in the background.");
      scheduleReconnect();
    }
  }
}

function scheduleReconnect() {
  if (isConnecting) return;
  setTimeout(async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
      isConnecting = true;
      await mongoose.connect(env.mongoUri, {
        dbName: "trendgo",
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`\n🎉 MongoDB Atlas connected successfully! (database: ${mongoose.connection.name})\n`);
    } catch {
      scheduleReconnect();
    } finally {
      isConnecting = false;
    }
  }, 15000);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
