import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-primary-light text-primary",
  teal: "bg-accent-light text-accent",
  purple: "bg-purple-light text-purple",
  green: "bg-success-bg text-success",
  amber: "bg-warning-bg text-warning",
  red: "bg-danger-bg text-danger",
  gray: "bg-[#EEF2F6] text-muted",
  navy: "bg-[#E8EDF2] text-navy",
} as const;

export function StatusBadge({
  children,
  tone = "gray",
  className,
  dot,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" /> : null}
      {children}
    </span>
  );
}
