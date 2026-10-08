"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "business" | "technical";

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-0.5 shadow-sm">
      {(
        [
          { id: "business", label: "Business view" },
          { id: "technical", label: "Technical view" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            value === opt.id
              ? "bg-primary text-white"
              : "text-muted hover:bg-bg hover:text-navy"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
