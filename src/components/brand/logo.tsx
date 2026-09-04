import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/12",
        "shadow-[0_0_24px_-8px_oklch(0.66_0.25_305/0.9)]",
        className,
      )}
    >
      {/* Abstract spark / location pin */}
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
        <path
          d="M12 3.2c.35 2.6 1.3 4.2 3 5.2-1.7 1-2.65 2.6-3 5.2-.35-2.6-1.3-4.2-3-5.2 1.7-1 2.65-2.6 3-5.2Z"
          fill="var(--primary-glow)"
        />
        <path
          d="M12 21c3.2-3.6 5-6.1 5-8.4a5 5 0 1 0-10 0c0 2.3 1.8 4.8 5 8.4Z"
          stroke="var(--primary)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Trend<span className="text-gradient-brand">Go</span>
      </span>
    </span>
  );
}
