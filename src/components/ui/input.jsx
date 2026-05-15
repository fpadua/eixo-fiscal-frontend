import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        className
      )}
      {...props}
    />
  );
})
Input.displayName = "Input"

export { Input }