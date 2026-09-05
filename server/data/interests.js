export const INTEREST_CATEGORIES = Object.freeze([
  "Music",
  "Techno",
  "Indie",
  "Comedy",
  "Sports",
  "Food",
  "Workshops",
  "Art",
  "Theatre",
  "Nightlife",
  "Communities",
  "Outdoor",
  "Startups",
  "Photography",
]);

const interestSet = new Set(INTEREST_CATEGORIES);

export function areValidInterests(interests) {
  return (
    Array.isArray(interests) &&
    interests.length <= INTEREST_CATEGORIES.length &&
    interests.every((interest) => typeof interest === "string" && interestSet.has(interest)) &&
    new Set(interests).size === interests.length
  );
}
