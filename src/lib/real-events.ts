import type { EventItem } from "@/data/mock";

function getDynamicDate(
  daysAhead: number,
  hours: number,
  minutes: number = 0,
): { dateStr: string; timeStr: string; dayGroup: EventItem["dayGroup"] } {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  target.setHours(hours, minutes, 0, 0);

  const dateStr = target.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const timeStr = target.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  let dayGroup: EventItem["dayGroup"] = "This weekend";
  if (daysAhead === 0) dayGroup = "Today";
  else if (daysAhead === 1) dayGroup = "Tomorrow";
  else if (daysAhead <= 6) dayGroup = "This weekend";
  else dayGroup = "Next week";

  return { dateStr, timeStr, dayGroup };
}

export const REAL_EVENTS_CATALOG: (EventItem & { city: string })[] = [
  {
    id: "sula-sidewalk-sessions",
    title: "Sula Sidewalk Sessions: Acoustic Sunset & Wine",
    image:
      "https://images.unsplash.com/photo-1501386761578-eaa54b4af1b8?auto=format&fit=crop&w=1200&q=80",
    category: "Music",
    match: 96,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(2, 17, 30);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Vineyard Amphitheatre, Sula Vineyards",
    area: "Gangapur-Savargaon Road",
    city: "Nashik",
    distanceKm: 4.2,
    price: 499,
    tags: ["Live Music", "Acoustic", "Vineyard", "Sunset"],
    organizer: {
      name: "Nashik Afterhours",
      blurb: "Curated sunset soundtracks in the vineyards",
      initials: "NA",
    },
    description:
      "A mellow sunset set of indie folk and acoustic originals with regional artisan food stalls and a scenic view across the rolling Sahyadri vineyards.",
    interested: 48,
    friendIds: ["sneha", "dev"],
    reasons: [
      "Top music venue in Nashik",
      "Sunset vibes & wine tastings",
      "Matches your music taste",
    ],
  },
  {
    id: "godavari-art-heritage-walk",
    title: "Godavari Riverside Heritage & Sketch Walk",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
    category: "Art",
    match: 91,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(3, 16, 0);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Ramkund Steps & Ghats",
    area: "Panchavati",
    city: "Nashik",
    distanceKm: 2.8,
    price: 0,
    tags: ["Art Walk", "Heritage", "Free", "Community"],
    organizer: {
      name: "Kala Nashik",
      blurb: "Rediscovering the historic riverfront through art",
      initials: "KN",
    },
    description:
      "An easy-paced guided walk through historic Panchavati ghats, temporary pop-up installations, live sketch corners, and open conversations with emerging Nashik artists.",
    interested: 64,
    friendIds: ["aisha"],
    reasons: [
      "Free community walk",
      "Historic Ramkund ghats",
      "Great for creatives",
    ],
  },
  {
    id: "nashik-founders-chai",
    title: "Nashik Founders & Builders Chai",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    category: "Communities",
    match: 87,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(4, 18, 30);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "The Reading Room Cafe",
    area: "College Road",
    city: "Nashik",
    distanceKm: 1.5,
    price: 149,
    tags: ["Founders", "Startups", "Networking", "Chai"],
    organizer: {
      name: "Build Nashik",
      blurb: "A space for creators, designers, and founders",
      initials: "BN",
    },
    description:
      "A no-stage casual evening for local founders, engineers, and designers to swap notes, meet collaborators, and showcase what they are building over hot kulhad chai.",
    interested: 39,
    friendIds: ["rahul"],
    reasons: [
      "Tech & startup community",
      "College Road hotspot",
      "Informal discussions",
    ],
  },
  {
    id: "soma-wine-tour-sunset",
    title: "Soma Sunset Wine Trail & Grape Stomping",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    category: "Food",
    match: 94,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(1, 16, 30);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Soma Vine Village",
    area: "Gangapur Dam Backwaters",
    city: "Nashik",
    distanceKm: 7.2,
    price: 799,
    tags: ["Wine Tasting", "Food", "Backwaters", "Sunset"],
    organizer: {
      name: "Soma Experiences",
      blurb: "Wine trails along Gangapur backwaters",
      initials: "SE",
    },
    description:
      "An experiential tour of grape fermentation, guided barrel room tastings, optional grape stomping, and an artisanal cheese board overlooking the calm backwaters of Gangapur Dam.",
    interested: 82,
    friendIds: ["sneha", "mira"],
    reasons: [
      "Top rated experience in Nashik",
      "Gangapur Dam backwaters view",
      "Great food & wine pairings",
    ],
  },
  {
    id: "nashik-comedy-open-mic",
    title: "Unfiltered: Nashik Standup Comedy Open Mic",
    image:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    category: "Comedy",
    match: 88,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(2, 20, 0);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Cafe Meraki Rooftop",
    area: "Thatte Nagar, College Road",
    city: "Nashik",
    distanceKm: 2.1,
    price: 199,
    tags: ["Standup", "Comedy", "Late Night", "College Road"],
    organizer: {
      name: "Nashik Comedy Guild",
      blurb: "Local humor, fresh jokes, zero filter",
      initials: "NC",
    },
    description:
      "A raw, high-energy late evening comedy session featuring 8 emerging Nashik comedians trying fresh material, accompanied by a special guest headliner from Mumbai.",
    interested: 53,
    friendIds: ["rahul", "dev"],
    reasons: [
      "Popular College Road night",
      "Fast-paced comedy",
      "Rooftop ambiance",
    ],
  },
  {
    id: "pandavleni-sunrise-trek",
    title: "Pandavleni Sunrise Trail & Buddhist Heritage Walk",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    category: "Outdoor",
    match: 90,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(5, 6, 0);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Pandavleni Cave Steps",
    area: "Pathardi Phata, NH3",
    city: "Nashik",
    distanceKm: 6.0,
    price: 0,
    tags: ["Trek", "Sunrise", "Heritage", "Outdoor", "Free"],
    organizer: {
      name: "Sahyadri Explorers Nashik",
      blurb: "Early morning mountain trails around Nashik",
      initials: "SE",
    },
    description:
      "Climb 300 steps in the cool morning mist to the 2,000-year-old Trirashmi Buddhist caves. Catch the sunrise across the Nashik valley, followed by group tea at the base.",
    interested: 71,
    friendIds: ["dev"],
    reasons: [
      "Panoramic Nashik skyline",
      "Ancient rock-cut caves",
      "Energizing morning walk",
    ],
  },
  {
    id: "panchavati-misal-crawl",
    title: "Old Nashik Heritage Food Trail & Misal Crawl",
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    category: "Food",
    match: 85,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(6, 8, 30);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Historic Wada Courtyard",
    area: "Old Nashik & Raviwar Peth",
    city: "Nashik",
    distanceKm: 3.1,
    price: 349,
    tags: ["Food Trail", "Misal", "Old City", "Breakfast"],
    organizer: {
      name: "The Hungry Nashikkar",
      blurb: "Stories of old Nashik through traditional flavours",
      initials: "HN",
    },
    description:
      "Taste authentic wood-fired Nashik misal, traditional wadas, freshly roasted farsan, and historic dessert spots through winding alleys that standard food apps miss.",
    interested: 60,
    friendIds: ["rahul", "aisha"],
    reasons: [
      "Authentic traditional flavours",
      "Historic old wadas",
      "Small group tour",
    ],
  },
  {
    id: "godavari-pottery-lab",
    title: "Riverfront Clay & Pottery Workshop",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    category: "Workshops",
    match: 89,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(3, 10, 30);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "Mitti Kala Studio",
    area: "Anandwalli, Gangapur Road",
    city: "Nashik",
    distanceKm: 3.8,
    price: 699,
    tags: ["Pottery", "Workshop", "Hands-on", "Mindful"],
    organizer: {
      name: "Mitti Kala Nashik",
      blurb: "Mindful handbuilding with natural clays",
      initials: "MK",
    },
    description:
      "A tactile 3-hour morning workshop learning handbuilding and wheel throwing. Shape your own coffee mug or vase under guidance of master potters, with all materials included.",
    interested: 42,
    friendIds: ["sneha"],
    reasons: [
      "Take home your creation",
      "Quiet riverside studio",
      "Beginner friendly",
    ],
  },
  {
    id: "monsoon-lens-photo-walk",
    title: "Monsoon Lens: Street Photography Walk",
    image:
      "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80",
    category: "Photography",
    match: 92,
    ...(() => {
      const { dateStr, timeStr, dayGroup } = getDynamicDate(7, 15, 30);
      return { date: dateStr, time: timeStr, dayGroup };
    })(),
    venue: "MG Road & Main Market Gate",
    area: "Old Nashik",
    city: "Nashik",
    distanceKm: 2.5,
    price: 249,
    tags: ["Photography", "Photowalk", "Workshop"],
    organizer: {
      name: "Frame by Frame Nashik",
      blurb: "Walks for people who notice details",
      initials: "FF",
    },
    description:
      "Bring any camera or phone for an eye-opening golden-hour photo walk around historic markets and wooden wadas of old Nashik, followed by a friendly cafe review session.",
    interested: 35,
    friendIds: ["aisha"],
    reasons: [
      "Practical shooting tips",
      "Hidden architectural gems",
      "Constructive photo feedback",
    ],
  },
];

export function filterRealEvents(
  params: Record<string, string | number | undefined>,
): {
  events: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
} {
  const city =
    typeof params.city === "string" ? params.city.trim().toLowerCase() : "";
  const category =
    typeof params.category === "string"
      ? params.category.trim().toLowerCase()
      : "";
  const query =
    typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const date = typeof params.date === "string" ? params.date : "";
  const maxPrice =
    params.price !== undefined && params.price !== ""
      ? Number(params.price)
      : undefined;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;

  let filtered = [...REAL_EVENTS_CATALOG];

  if (city) {
    filtered = filtered.filter((ev) => {
      const evCity = (ev.city || "").toLowerCase();
      const evArea = (ev.area || "").toLowerCase();
      const evVenue = (ev.venue || "").toLowerCase();
      return (
        evCity.includes(city) ||
        evArea.includes(city) ||
        evVenue.includes(city) ||
        city.includes(evCity)
      );
    });
  }

  if (category) {
    const categories = category.split(",").map((c) => c.trim().toLowerCase());
    filtered = filtered.filter((ev) =>
      categories.includes(ev.category.toLowerCase()),
    );
  }

  if (query) {
    filtered = filtered.filter((ev) => {
      const haystack =
        `${ev.title} ${ev.description} ${ev.venue} ${ev.area} ${ev.category} ${ev.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  if (date && date !== "Any time") {
    filtered = filtered.filter(
      (ev) =>
        ev.dayGroup === date ||
        ev.date.toLowerCase().includes(date.toLowerCase()),
    );
  }

  if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
    filtered = filtered.filter((ev) => ev.price <= maxPrice);
  }

  const sort = params.sort;
  if (sort === "soonest") {
    filtered.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sort === "price") {
    filtered.sort((a, b) => a.price - b.price);
  } else {
    filtered.sort((a, b) => b.match - a.match);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    events: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page * limit < total,
    },
  };
}

export function findRealEventById(id: string): EventItem | undefined {
  return REAL_EVENTS_CATALOG.find((e) => e.id === id);
}
