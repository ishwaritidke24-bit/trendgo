import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Event } from "../models/event.model.js";
import { seedEvents } from "../data/seed-events.data.js";

async function seed() {
  await connectDatabase();
  await Event.deleteMany({});
  await Event.insertMany(seedEvents);
  console.log(`Seeded ${seedEvents.length} TrendGo events.`);
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error("Unable to seed events", error);
  await disconnectDatabase();
  process.exitCode = 1;
});
