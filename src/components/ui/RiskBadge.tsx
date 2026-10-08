import type { RiskLevel } from "@prisma/client";
import { riskShortLabels } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";

const map: Record<RiskLevel, "green" | "amber" | "red" | "gray"> = {
  LOW: "green",
  MEDIUM: "amber",
  HIGH: "red",
  MISSION_CRITICAL: "red",
  NOT_ASSESSED: "gray",
};

export function RiskBadge({ level, showLabel = true }: { level: RiskLevel; showLabel?: boolean }) {
  const label = riskShortLabels[level];
  return (
    <StatusBadge tone={map[level]} dot>
      {showLabel && level !== "NOT_ASSESSED" && level !== "MISSION_CRITICAL" ? `${label} Risk` : label}
    </StatusBadge>
  );
}
