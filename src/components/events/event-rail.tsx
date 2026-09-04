import * as React from "react";

import { EventCard } from "@/components/events/event-card";
import type { EventItem } from "@/data/mock";
import { cn } from "@/lib/utils";

export function EventRail({
  events,
  className,
  showWhy = false,
}: {
  events: EventItem[];
  className?: string;
  showWhy?: boolean;
}) {
  return (
    <div
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          size="compact"
          showWhy={showWhy}
          className="w-[78vw] shrink-0 snap-start sm:w-[20rem]"
        />
      ))}
    </div>
  );
}
