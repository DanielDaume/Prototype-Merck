import type { RiskLevel } from "@prisma/client";
import { riskShortLabels } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";

const map: Record<RiskLevel, "green" | "amber" | "red" | "gray"> = {
  LOW: "green",
  MEDIUM: "amber",
  HIGH: "red",
  NOT_ASSESSED: "gray",
};

export function RiskBadge({ level, showLabel = true }: { level: RiskLevel; showLabel?: boolean }) {
  return (
    <StatusBadge tone={map[level]} dot>
      {showLabel ? riskShortLabels[level] : riskShortLabels[level]}
      {showLabel && level !== "NOT_ASSESSED" ? " Risk" : ""}
    </StatusBadge>
  );
}
