"use client"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white shadow-[0_15px_40px_-20px_rgba(67,56,202,0.9)] hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_rgba(67,56,202,0.85)] focus-visible:ring-accent focus-visible:ring-offset-2",
        secondary:
          "bg-surface border border-border text-text hover:bg-surface-2 hover:border-white/20 focus-visible:ring-accent focus-visible:ring-offset-2",
        outline: "border border-border bg-transparent text-text hover:bg-surface-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        ghost: "bg-transparent text-text2 hover:bg-surface dark:hover:bg-surface cursor-pointer",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
