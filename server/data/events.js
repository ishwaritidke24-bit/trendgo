const events = [
  [
    "indie-basement",
    "Basement Sessions: Indie Night Vol. 12",
    "Music",
    "Fri, 12 Sep",
    "8:30 PM",
    "This weekend",
    "The Humming Tree",
    "Indiranagar",
    3.2,
    499,
  ],
  [
    "open-mic",
    "Unfiltered - Standup Open Mic",
    "Comedy",
    "Sat, 13 Sep",
    "7:00 PM",
    "This weekend",
    "That Comedy Club",
    "Koramangala",
    4.6,
    249,
  ],
  [
    "rooftop-market",
    "Rooftop Supper Club & Night Market",
    "Food",
    "Sun, 14 Sep",
    "6:00 PM",
    "This weekend",
    "Terrace 9",
    "Church Street",
    6.3,
    899,
  ],
  [
    "gallery-late",
    "Gallery Late: After Hours Art Walk",
    "Art",
    "Thu, 11 Sep",
    "8:00 PM",
    "Tomorrow",
    "Gallery Ske",
    "Lavelle Road",
    5.1,
    0,
  ],
  [
    "techno-terrace",
    "Concrete: Terrace Techno w/ Nula",
    "Nightlife",
    "Sat, 13 Sep",
    "10:00 PM",
    "This weekend",
    "Concrete Rooftop",
    "Residency Road",
    5.8,
    799,
  ],
  [
    "clay-studio",
    "Hands on Clay: Beginner Wheel Workshop",
    "Workshops",
    "Sun, 14 Sep",
    "11:00 AM",
    "This weekend",
    "Mud & Method",
    "Jayanagar",
    8.4,
    1499,
  ],
  [
    "turf-league",
    "Floodlit 5s - Friday Turf League",
    "Sports",
    "Fri, 12 Sep",
    "9:30 PM",
    "This weekend",
    "Astro Park",
    "HSR Layout",
    9.2,
    350,
  ],
  [
    "sunrise-trek",
    "Sunrise Ridge Trek & Filter Coffee",
    "Outdoor",
    "Sat, 20 Sep",
    "4:30 AM",
    "Next week",
    "Skandagiri Base",
    "Chikkaballapur",
    61,
    1200,
  ],
  [
    "loft-meetup",
    "Makers Loft: Thursday Community Night",
    "Communities",
    "Thu, 11 Sep",
    "7:30 PM",
    "Tomorrow",
    "The Loft",
    "Domlur",
    2.4,
    0,
  ],
].map(([id, title, category, date, time, dayGroup, venue, area, distanceKm, price]) => ({
  id,
  title,
  category,
  date,
  time,
  dayGroup,
  venue,
  area,
  distanceKm,
  price,
  image: {
    Music:
      "https://images.unsplash.com/photo-1501388528161-7c3c5f6b6a3d?auto=format&fit=crop&w=1200&q=80",
    Comedy:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    Food: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    Art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
    Nightlife:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    Workshops:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    Sports:
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=80",
    Outdoor:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    Communities:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  }[category],
  match: 0,
  tags: [category],
  organizer: { name: "TrendGo Organizer", blurb: "Local experiences", initials: "TG" },
  description: "Discover this experience and make a plan with your people.",
  interested: 0,
  friendIds: [],
  reasons: [],
}));

export function searchEvents({
  query = "",
  category = "",
  date = "",
  location = "",
  price,
  distance,
  sort = "match",
} = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = events.filter((event) => {
    const searchable =
      `${event.title} ${event.category} ${event.area} ${event.venue}`.toLowerCase();
    if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
    if (category && !category.split(",").includes(event.category)) return false;
    if (date && date !== "Any time" && event.dayGroup !== date) return false;
    if (location && !`${event.area} ${event.venue}`.toLowerCase().includes(location.toLowerCase()))
      return false;
    if (price !== undefined && price !== "" && event.price > Number(price)) return false;
    if (distance !== undefined && distance !== "" && event.distanceKm > Number(distance))
      return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (sort === "nearest") return a.distanceKm - b.distanceKm;
    if (sort === "price") return a.price - b.price;
    if (sort === "soonest") return a.date.localeCompare(b.date);
    return b.match - a.match;
  });
}

export function getEvent(eventId) {
  return events.find((event) => event.id === eventId) ?? null;
}
