import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    width: {
      default: "max-w-7xl",
      narrow: "max-w-3xl",
      wide: "max-w-[90rem]",
      full: "max-w-none",
    },
  },
  defaultVariants: { width: "default" },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

export function Container({ className, width, as: Comp = "div", ...props }: ContainerProps) {
  return <Comp className={cn(containerVariants({ width }), className)} {...props} />;
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "default" | "lg";
}

const sectionSpacing = {
  sm: "py-10 sm:py-14",
  default: "py-16 sm:py-20",
  lg: "py-24 sm:py-32",
} as const;

export function Section({ className, spacing = "default", ...props }: SectionProps) {
  return <section className={cn(sectionSpacing[spacing], className)} {...props} />;
}
