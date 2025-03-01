import type React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-full h-4 w-4 bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
