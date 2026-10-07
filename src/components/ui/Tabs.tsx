"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-navy"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
