export function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    location: user.location,
    discoveryLocations: user.discoveryLocations ?? [],
    interests: user.interests,
    avatar: user.avatar ?? "",
    onboardingCompleted: user.onboardingCompleted ?? false,
    savedEventIds: user.savedEventIds ?? [],
    interestedEventIds: user.interestedEventIds ?? [],
    attendedEventIds: user.attendedEventIds ?? [],
    roles: user.roles ?? ["explorer"],
    organizerStatus: user.organizerStatus ?? "not_started",
    organizerProfileId: user.organizerProfileId?.toString() ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
