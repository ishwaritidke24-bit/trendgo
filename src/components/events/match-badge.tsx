import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function MatchBadge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[image:var(--gradient-brand)] px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]",
        className,
      )}
    >
      <Sparkles className="size-3" />
      {value}% Match
    </span>
  );
}
