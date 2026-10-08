"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { computeMetadataCompleteness } from "@/lib/metadata-requirements";

type Completeness = ReturnType<typeof computeMetadataCompleteness>;

export function MetadataCompleteness({ data }: { data: Completeness }) {
  return (
    <div className="rounded-[12px] border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy">Metadata completeness</h3>
        <span className="text-[11px] text-muted">Workshop requirement table</span>
      </div>
      <div className="space-y-3">
        {data.groups.map((group) => {
          const pct = Math.round((group.complete / group.total) * 100);
          const warn = group.priority === "HIGH" && group.missing.length > 0;
          return (
            <div key={group.priority}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-medium text-navy">
                  {group.priority === "HIGH"
                    ? "High priority"
                    : group.priority === "MEDIUM"
                      ? "Medium priority"
                      : "Low priority"}
                </span>
                <span className={warn ? "font-semibold text-warning" : "text-muted"}>
                  {group.complete} / {group.total} complete
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
                <div
                  className={`h-full rounded-full ${
                    warn ? "bg-warning" : group.priority === "HIGH" ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
              {warn && group.missing.length > 0 ? (
                <div className="mt-2 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2">
                  <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    High priority metadata missing
                  </div>
                  <ul className="space-y-0.5 text-[12px] text-[#4A5568]">
                    {group.missing.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
              ) : group.priority === "HIGH" ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All high-priority fields present
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
