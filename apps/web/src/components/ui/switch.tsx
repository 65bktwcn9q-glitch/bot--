import * as SwitchPrimitive from "@radix-ui/react-switch";
import React from "react";
import { cn } from "../../utils/cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 transition data-[state=checked]:bg-brand-500",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className="block h-4 w-4 translate-x-1 rounded-full bg-white transition data-[state=checked]:translate-x-4"
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
