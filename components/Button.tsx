import type React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export default function Button({ className, variant = "default", size = "md", children, ...props }: ButtonProps) {
  const sizeClasses = {
    sm: "text-sm px-4 py-2",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4",
  }

  const variantClasses = {
    default: "bg-[#0082ed] text-white hover:bg-[#0082ed]/90",
    outline: "border border-[#0082ed] text-[#0082ed] hover:bg-[#0082ed]/10",
    ghost: "text-[#0082ed] hover:bg-[#0082ed]/10",
  }

  return (
    <button
      className={cn(
        className,
        sizeClasses[size],
        variantClasses[variant],
        "rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      {...props}
    >
      {children}
    </button>
  )
}

