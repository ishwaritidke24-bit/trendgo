export function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    location: user.location,
    interests: user.interests,
    savedEventIds: user.savedEventIds ?? [],
    interestedEventIds: user.interestedEventIds ?? [],
    attendedEventIds: user.attendedEventIds ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
