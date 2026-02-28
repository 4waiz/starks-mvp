import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "btn-gloss px-6 py-3 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]",
        secondary:
          "border border-transparent bg-[linear-gradient(rgba(7,11,29,0.9),rgba(7,11,29,0.9))_padding-box,linear-gradient(120deg,rgba(139,92,246,0.7),rgba(217,70,239,0.65),rgba(34,211,238,0.65))_border-box] bg-[length:220%_220%] px-5 py-2.5 text-white/90 backdrop-blur-xl hover:animate-[gradient-shift_2.8s_ease_infinite]",
        ghost:
          "px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
