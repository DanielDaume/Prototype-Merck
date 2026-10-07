import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-[26px] font-semibold tracking-tight text-navy">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}
