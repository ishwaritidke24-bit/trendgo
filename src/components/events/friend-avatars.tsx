import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { friendById } from "@/data/mock";
import { cn } from "@/lib/utils";

export function FriendAvatars({
  ids,
  size = "sm",
  max = 4,
  className,
}: {
  ids: string[];
  size?: "sm" | "default" | "lg";
  max?: number;
  className?: string;
}) {
  const shown = ids.slice(0, max);
  const rest = ids.length - shown.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {shown.map((id) => {
        const friend = friendById(id);
        if (!friend) return null;
        return (
          <Avatar key={id} size={size} className="ring-2 ring-background">
            <AvatarImage src={friend.avatar} alt={friend.name} />
            <AvatarFallback>{friend.initials}</AvatarFallback>
          </Avatar>
        );
      })}
      {rest > 0 ? (
        <span className="grid size-8 place-items-center rounded-full border border-border-strong bg-surface text-[11px] font-medium text-muted-foreground ring-2 ring-background">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
