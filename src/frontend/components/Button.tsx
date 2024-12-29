import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/frontend/utils"
import { Loading } from "./Loading"

const buttonVariants = cva(
  "svg-inline inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-anchor transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-anchor/90 hover:bg-anchor text-white clickable hover:outline-1 hover:outline-offset-1 hover:outline-anchor",
        outline: "text-white clickable border border-anchor",
        error: "bg-red-500 text-white clickable",
        combobox: "border border-transparent hover:border-anchor text-white bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-6 rounded-md px-3",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  inProgress?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button = ({ 
  children, 
  className, 
  variant, 
  size, 
  asChild = false, 
  inProgress = false,
  ref,
  ...props 
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {inProgress ? <Loading /> : children}
    </Comp>
  )
}
Button.displayName = "Button"

export { Button, buttonVariants }
