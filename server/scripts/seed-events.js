import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Event } from "../models/event.model.js";

const daysFromNow = (days) => {
  const date = new Date();
  date.setHours(19, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const host = (name, blurb) => ({
  name,
  blurb,
  initials: name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
});

const seedEvents = [
  {
    title: "Sula Sidewalk Sessions",
    description:
      "A mellow sunset set of indie folk and acoustic originals with local food stalls and a view across the vineyards.",
    category: "Music",
    tags: ["Indie", "Live music", "Sunset"],
    image:
      "https://images.unsplash.com/photo-1501388528161-7c3c5f6b6a3d?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(2),
    startTime: "5:30 PM",
    endTime: "9:30 PM",
    venue: "Vineyard Amphitheatre",
    address: "Gangapur-Savargaon Road, Nashik",
    city: "Nashik",
    latitude: 20.0031,
    longitude: 73.7309,
    price: 499,
    capacity: 180,
    organizer: host("Nashik Afterhours", "Small evenings with a good soundtrack"),
    status: "published",
  },
  {
    title: "Godavari Riverside Art Walk",
    description:
      "An easy-paced guided walk through temporary installations, sketch corners and conversations with emerging Nashik artists.",
    category: "Art",
    tags: ["Art walk", "Free", "Community"],
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(3),
    startTime: "4:00 PM",
    endTime: "6:30 PM",
    venue: "Ramkund Steps",
    address: "Panchavati, Nashik",
    city: "Nashik",
    latitude: 20.0059,
    longitude: 73.7915,
    price: 0,
    capacity: 80,
    organizer: host("Kala Nashik", "Making the city a little more curious"),
    status: "published",
  },
  {
    title: "Nashik Founders Chai",
    description:
      "A no-stage evening for founders, designers and builders to swap notes, meet collaborators and show what they are making.",
    category: "Startups",
    tags: ["Founders", "Networking", "Chai"],
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(5),
    startTime: "6:30 PM",
    endTime: "8:30 PM",
    venue: "The Reading Room",
    address: "College Road, Nashik",
    city: "Nashik",
    latitude: 20.0111,
    longitude: 73.7906,
    price: 149,
    capacity: 55,
    organizer: host("Build Nashik", "A room for people making useful things"),
    status: "published",
  },
  {
    title: "Monsoon Lens: Street Photography Lab",
    description:
      "Bring any camera or phone for a practical golden-hour photo walk around old Nashik, followed by a friendly edit review.",
    category: "Photography",
    tags: ["Photography", "Workshop", "Beginner friendly"],
    image:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(7),
    startTime: "3:30 PM",
    endTime: "7:00 PM",
    venue: "Nashik City Centre",
    address: "MG Road, Nashik",
    city: "Nashik",
    latitude: 20.0034,
    longitude: 73.7884,
    price: 299,
    capacity: 30,
    organizer: host("Frame by Frame", "Walks for people who notice things"),
    status: "published",
  },
  {
    title: "Koregaon Park Comedy Room",
    description:
      "A tight late-evening lineup of new comics, fresh material and one very opinionated host.",
    category: "Comedy",
    tags: ["Stand-up", "Late show"],
    image:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(2),
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    venue: "The Laughing Room",
    address: "Koregaon Park, Pune",
    city: "Pune",
    latitude: 18.5362,
    longitude: 73.8939,
    price: 399,
    capacity: 120,
    organizer: host("Pune Punchline", "Independent comedy nights"),
    status: "published",
  },
  {
    title: "Clay & Coffee Sunday",
    description:
      "A slow Sunday morning learning hand-building basics with clay, coffee and enough time to make something imperfectly yours.",
    category: "Workshops",
    tags: ["Ceramics", "Hands on", "Sunday"],
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(8),
    startTime: "10:30 AM",
    endTime: "1:30 PM",
    venue: "Mitti Studio",
    address: "Kothrud, Pune",
    city: "Pune",
    latitude: 18.5074,
    longitude: 73.8077,
    price: 1199,
    capacity: 16,
    organizer: host("Mitti Studio", "Make with your hands"),
    status: "published",
  },
  {
    title: "Bandra Rooftop Techno",
    description:
      "A focused, no-frills rooftop session with local selectors, a warm sound system and the city lights doing the rest.",
    category: "Techno",
    tags: ["Techno", "Nightlife", "Rooftop"],
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(4),
    startTime: "9:00 PM",
    endTime: "2:00 AM",
    venue: "Sea Change Terrace",
    address: "Bandra West, Mumbai",
    city: "Mumbai",
    latitude: 19.0596,
    longitude: 72.8295,
    price: 899,
    capacity: 220,
    organizer: host("After Dark Bombay", "Sound-first nights in the city"),
    status: "published",
  },
  {
    title: "Mumbai Midnight Food Crawl",
    description:
      "A guided walk through old favourites and new late-night kitchens, with tasting plates and a final kulfi stop.",
    category: "Food",
    tags: ["Food crawl", "Late night", "Small group"],
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    date: daysFromNow(6),
    startTime: "10:00 PM",
    endTime: "1:00 AM",
    venue: "Mohammed Ali Road",
    address: "Bhendi Bazaar, Mumbai",
    city: "Mumbai",
    latitude: 18.9602,
    longitude: 72.8311,
    price: 749,
    capacity: 24,
    organizer: host("The Hungry Hour", "City stories, one plate at a time"),
    status: "published",
  },
];

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
