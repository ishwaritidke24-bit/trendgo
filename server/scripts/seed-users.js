import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { User } from "../models/user.model.js";

const SEED_USERS = [
  {
    name: "Aarav Sharma",
    email: "aarav@trendgo.dev",
    password: "Password123!",
    location: "Nashik",
    discoveryLocations: ["Nashik", "Mumbai"],
    interests: ["Music", "Startups", "Food"],
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    onboardingCompleted: true,
  },
  {
    name: "Priya Patel",
    email: "priya@trendgo.dev",
    password: "Password123!",
    location: "Mumbai",
    discoveryLocations: ["Mumbai", "Pune"],
    interests: ["Techno", "Art", "Music"],
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    onboardingCompleted: true,
  },
  {
    name: "Rohan Mehta",
    email: "rohan@trendgo.dev",
    password: "Password123!",
    location: "Pune",
    discoveryLocations: ["Pune", "Mumbai"],
    interests: ["Food", "Comedy", "Communities"],
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    onboardingCompleted: true,
  },
  {
    name: "Ananya Desai",
    email: "ananya@trendgo.dev",
    password: "Password123!",
    location: "Nashik",
    discoveryLocations: ["Nashik"],
    interests: ["Art", "Outdoor", "Music"],
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    onboardingCompleted: true,
  },
  {
    name: "Vikram Joshi",
    email: "vikram@trendgo.dev",
    password: "Password123!",
    location: "Mumbai",
    discoveryLocations: ["Mumbai"],
    interests: ["Techno", "Nightlife", "Music"],
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    onboardingCompleted: true,
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha@trendgo.dev",
    password: "Password123!",
    location: "Nashik",
    discoveryLocations: ["Nashik", "Pune"],
    interests: ["Music", "Food", "Outdoor"],
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    onboardingCompleted: true,
  },
];

async function seedUsers() {
  await connectDatabase();
  console.log("Seeding test community users...");

  for (const item of SEED_USERS) {
    const existing = await User.findOne({ email: item.email });
    if (existing) {
      console.log(`User already exists: ${item.name} (${item.email})`);
      continue;
    }

    const passwordHash = await bcrypt.hash(item.password, 10);
    await User.create({
      ...item,
      passwordHash,
    });
    console.log(`Created user: ${item.name} (${item.email})`);
  }

  console.log("User seeding complete.");
  await disconnectDatabase();
}

seedUsers().catch((err) => {
  console.error("Failed to seed users:", err);
  process.exit(1);
});
