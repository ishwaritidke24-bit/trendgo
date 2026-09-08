import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ease-[var(--ease-out-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-surface/60 text-muted-foreground hover:text-foreground hover:border-border-strong hover:bg-surface-elevated",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface",
        accent:
          "border border-primary/30 bg-primary/12 text-primary-glow hover:bg-primary/20",
      },
      size: {
        default: "h-10 w-10 [&_svg]:size-[18px]",
        sm: "h-8 w-8 [&_svg]:size-4",
        lg: "h-11 w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface IconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  /** Accessible label — required since the button has no visible text. */
  label: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant, size, asChild = false, label, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
