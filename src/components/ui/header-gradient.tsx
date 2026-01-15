import { cn } from "@/lib/utils";

interface HeaderGradientProps {
  className?: string;
}

export function HeaderGradient({ className }: HeaderGradientProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-[40vh] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent -z-10 rounded-b-[4rem]",
        className,
      )}
    />
  );
}
