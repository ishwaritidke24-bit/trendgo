import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  action,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className,
      )}
      {...props}
    >
      <div
        className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}
      >
        {eyebrow ? (
          <p className="mb-3 text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading
          className={cn(
            "font-display font-semibold text-balance text-foreground",
            Heading === "h1" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
