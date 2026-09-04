import eventMusic from "@/assets/event-music.jpg";
import eventComedy from "@/assets/event-comedy.jpg";
import eventFood from "@/assets/event-food.jpg";
import eventArt from "@/assets/event-art.jpg";
import eventNightlife from "@/assets/event-nightlife.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventSports from "@/assets/event-sports.jpg";
import eventOutdoor from "@/assets/event-outdoor.jpg";
import eventCommunity from "@/assets/event-community.jpg";

export const CATEGORIES = [
  "Music",
  "Comedy",
  "Sports",
  "Food",
  "Art",
  "Workshops",
  "Communities",
  "Nightlife",
  "Outdoor",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Friend {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  mutual: number;
  taste: string;
}

export interface EventItem {
  id: string;
  title: string;
  image: string;
  category: Category;
  match: number;
  date: string;
  time: string;
  dayGroup: "Today" | "Tomorrow" | "This weekend" | "Next week";
  venue: string;
  area: string;
  distanceKm: number;
  price: number;
  tags: string[];
  organizer: { name: string; blurb: string; initials: string };
  description: string;
  interested: number;
  friendIds: string[];
  reasons: string[];
  outsideBubble?: boolean;
}

const av = (seed: string) => `https://i.pravatar.cc/160?img=${seed}`;

export const FRIENDS: Friend[] = [
  { id: "sneha", name: "Sneha Rao", initials: "SR", avatar: av("47"), mutual: 12, taste: "Indie & live music" },
  { id: "rahul", name: "Rahul Menon", initials: "RM", avatar: av("12"), mutual: 8, taste: "Standup & food crawls" },
  { id: "aisha", name: "Aisha Khan", initials: "AK", avatar: av("32"), mutual: 21, taste: "Art walks & film" },
  { id: "dev", name: "Dev Sharma", initials: "DS", avatar: av("15"), mutual: 5, taste: "Football & trails" },
  { id: "mira", name: "Mira Joseph", initials: "MJ", avatar: av("45"), mutual: 17, taste: "Ceramics & slow mornings" },
  { id: "kabir", name: "Kabir Sen", initials: "KS", avatar: av("60"), mutual: 3, taste: "Techno & rooftops" },
];

export const friendById = (id: string) => FRIENDS.find((f) => f.id === id);

export const EVENTS: EventItem[] = [
  {
    id: "indie-basement",
    title: "Basement Sessions: Indie Night Vol. 12",
    image: eventMusic,
    category: "Music",
    match: 94,
    date: "Fri, 12 Sep",
    time: "8:30 PM",
    dayGroup: "This weekend",
    venue: "The Humming Tree",
    area: "Indiranagar",
    distanceKm: 3.2,
    price: 499,
    tags: ["Live music", "Indie", "Small venue"],
    organizer: { name: "Basement Collective", blurb: "Curating intimate gigs since 2018", initials: "BC" },
    description:
      "Three of the city's most-talked-about indie acts in a 120-capacity room. Low ceilings, loud amps, no phones on stage — the kind of night people describe for weeks.",
    interested: 128,
    friendIds: ["sneha", "kabir", "aisha"],
    reasons: ["You like electronic music", "3.2 km away", "2 friends are interested"],
  },
  {
    id: "open-mic",
    title: "Unfiltered — Standup Open Mic",
    image: eventComedy,
    category: "Comedy",
    match: 88,
    date: "Sat, 13 Sep",
    time: "7:00 PM",
    dayGroup: "This weekend",
    venue: "That Comedy Club",
    area: "Koramangala",
    distanceKm: 4.6,
    price: 249,
    tags: ["Standup", "New material", "Late show"],
    organizer: { name: "That Comedy Club", blurb: "Six nights of comedy a week", initials: "TC" },
    description:
      "Fifteen comics, five minutes each, zero safety nets. Half the sets are brand new material being tried in public for the first time.",
    interested: 214,
    friendIds: ["rahul", "mira"],
    reasons: ["You saved 2 comedy nights last month", "4.6 km away", "Rahul is going"],
  },
  {
    id: "rooftop-market",
    title: "Rooftop Supper Club & Night Market",
    image: eventFood,
    category: "Food",
    match: 81,
    date: "Sun, 14 Sep",
    time: "6:00 PM",
    dayGroup: "This weekend",
    venue: "Terrace 9",
    area: "Church Street",
    distanceKm: 6.3,
    price: 899,
    tags: ["Supper club", "Street food", "Sunset"],
    organizer: { name: "Slow Table", blurb: "Chef-led pop-ups around the city", initials: "ST" },
    description:
      "Twelve kitchens, one rooftop, and a sunset that does most of the work. Small plates, natural wine and a vinyl set that runs until close.",
    interested: 302,
    friendIds: ["aisha", "mira", "sneha"],
    reasons: ["You attended 3 food pop-ups", "Popular with people like you", "3 friends interested"],
  },
  {
    id: "gallery-late",
    title: "Gallery Late: After Hours Art Walk",
    image: eventArt,
    category: "Art",
    match: 79,
    date: "Thu, 11 Sep",
    time: "8:00 PM",
    dayGroup: "Tomorrow",
    venue: "Gallery Ske",
    area: "Lavelle Road",
    distanceKm: 5.1,
    price: 0,
    tags: ["Free entry", "Contemporary", "Guided"],
    organizer: { name: "Night Circuit", blurb: "After-dark culture programming", initials: "NC" },
    description:
      "Five galleries stay open past midnight with artist-led walkthroughs. Start anywhere, end at the courtyard bar.",
    interested: 96,
    friendIds: ["aisha"],
    reasons: ["You follow contemporary art", "Free entry", "Aisha is interested"],
  },
  {
    id: "techno-terrace",
    title: "Concrete: Terrace Techno w/ Nula",
    image: eventNightlife,
    category: "Nightlife",
    match: 86,
    date: "Sat, 13 Sep",
    time: "10:00 PM",
    dayGroup: "This weekend",
    venue: "Concrete Rooftop",
    area: "Residency Road",
    distanceKm: 5.8,
    price: 799,
    tags: ["Techno", "Rooftop", "Late night"],
    organizer: { name: "Concrete", blurb: "Sound-first parties, no VIP nonsense", initials: "CN" },
    description:
      "Six hours of hypnotic techno on a rooftop rig with a skyline you can actually see. Doors at ten, no re-entry after two.",
    interested: 421,
    friendIds: ["kabir", "dev"],
    reasons: ["You like electronic music", "Matches your late-night pattern", "Kabir is going"],
  },
  {
    id: "clay-studio",
    title: "Hands on Clay: Beginner Wheel Workshop",
    image: eventWorkshop,
    category: "Workshops",
    match: 72,
    date: "Sun, 14 Sep",
    time: "11:00 AM",
    dayGroup: "This weekend",
    venue: "Mud & Method",
    area: "Jayanagar",
    distanceKm: 8.4,
    price: 1499,
    tags: ["Hands on", "Small group", "Beginner"],
    organizer: { name: "Mud & Method", blurb: "Ten-person studio, one kiln", initials: "MM" },
    description:
      "Three hours on the wheel with a maker who will not let you leave until something holds water. Everything you make gets fired and shipped.",
    interested: 54,
    friendIds: ["mira"],
    reasons: ["You said you want to learn something new", "Mira signed up", "Small group of 10"],
    outsideBubble: true,
  },
  {
    id: "turf-league",
    title: "Floodlit 5s — Friday Turf League",
    image: eventSports,
    category: "Sports",
    match: 68,
    date: "Fri, 12 Sep",
    time: "9:30 PM",
    dayGroup: "This weekend",
    venue: "Astro Park",
    area: "HSR Layout",
    distanceKm: 9.2,
    price: 350,
    tags: ["5-a-side", "Casual", "Mixed level"],
    organizer: { name: "Astro Park", blurb: "Turf nights, all skill levels", initials: "AP" },
    description:
      "Drop-in five-a-side under floodlights. Teams get shuffled every twenty minutes so nobody gets stuck losing all night.",
    interested: 77,
    friendIds: ["dev"],
    reasons: ["Dev plays here weekly", "Something different for you", "Beginner friendly"],
    outsideBubble: true,
  },
  {
    id: "sunrise-trek",
    title: "Sunrise Ridge Trek & Filter Coffee",
    image: eventOutdoor,
    category: "Outdoor",
    match: 74,
    date: "Sat, 20 Sep",
    time: "4:30 AM",
    dayGroup: "Next week",
    venue: "Skandagiri Base",
    area: "Chikkaballapur",
    distanceKm: 61,
    price: 1200,
    tags: ["Trek", "Sunrise", "Group of 20"],
    organizer: { name: "Offbeat Trails", blurb: "Small-group treks near the city", initials: "OT" },
    description:
      "An early start, a two-hour climb above the cloud line, and filter coffee at the top. Transport from three pickup points included.",
    interested: 189,
    friendIds: ["dev", "sneha"],
    reasons: ["Step outside your bubble", "2 friends went last time", "Weekend escape"],
    outsideBubble: true,
  },
  {
    id: "loft-meetup",
    title: "Makers Loft: Thursday Community Night",
    image: eventCommunity,
    category: "Communities",
    match: 77,
    date: "Thu, 11 Sep",
    time: "7:30 PM",
    dayGroup: "Tomorrow",
    venue: "The Loft",
    area: "Domlur",
    distanceKm: 2.4,
    price: 0,
    tags: ["Meet people", "Free entry", "Creative"],
    organizer: { name: "Makers Loft", blurb: "A room of people building things", initials: "ML" },
    description:
      "No panels, no pitches. Twenty people show what they made this month and everyone argues about it over cheap beer.",
    interested: 63,
    friendIds: ["mira", "rahul", "aisha"],
    reasons: ["You want to meet people", "2.4 km away", "3 friends interested"],
  },
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

export interface ActivityItem {
  id: string;
  friendId: string;
  action: "interested in" | "is going to" | "saved" | "attended";
  eventId: string;
  when: string;
}

export const ACTIVITY: ActivityItem[] = [
  { id: "a1", friendId: "sneha", action: "interested in", eventId: "indie-basement", when: "2h ago" },
  { id: "a2", friendId: "rahul", action: "is going to", eventId: "open-mic", when: "5h ago" },
  { id: "a3", friendId: "aisha", action: "saved", eventId: "gallery-late", when: "Yesterday" },
  { id: "a4", friendId: "kabir", action: "is going to", eventId: "techno-terrace", when: "Yesterday" },
  { id: "a5", friendId: "mira", action: "interested in", eventId: "clay-studio", when: "2 days ago" },
  { id: "a6", friendId: "dev", action: "attended", eventId: "turf-league", when: "Last week" },
];

export const CURRENT_USER = {
  name: "Ananya Iyer",
  initials: "AI",
  avatar: av("5"),
  location: "Bengaluru",
  joined: "Joined March 2024",
  bio: "Chasing small rooms with loud music and anyone who'll come along.",
  interests: ["Electronic music", "Indie gigs", "Standup", "Supper clubs", "Contemporary art", "Night markets"],
  favouriteCategories: ["Music", "Nightlife", "Food", "Art"],
  stats: { attended: 37, saved: 14, friends: 128 },
};

export const MY_EVENTS: Record<"interested" | "saved" | "going" | "past", string[]> = {
  interested: ["indie-basement", "gallery-late", "loft-meetup"],
  saved: ["clay-studio", "sunrise-trek"],
  going: ["techno-terrace", "open-mic"],
  past: ["rooftop-market"],
};
