"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const ThemeSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SwitchPrimitives.Root
      ref={ref}
      checked={resolvedTheme === "dark"}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:focus-visible:ring-gray-300 dark:focus-visible:ring-offset-gray-900",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none relative block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-gray-100 text-gray-900"
        )}
      >
        <Sun
          className={cn(
            "absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
            resolvedTheme === "dark"
              ? "opacity-0 scale-50"
              : "opacity-100 scale-100"
          )}
        />
        <Moon
          className={cn(
            "absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
            resolvedTheme === "dark"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
          )}
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
});

ThemeSwitch.displayName = SwitchPrimitives.Root.displayName;

export { ThemeSwitch };
