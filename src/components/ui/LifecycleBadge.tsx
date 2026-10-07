import type { LifecycleStage } from "@prisma/client";
import { lifecycleLabels } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";

const map: Record<LifecycleStage, "blue" | "teal" | "green" | "amber" | "gray"> = {
  IDEA: "gray",
  PILOT: "blue",
  PRODUCTION: "green",
  RETIRING: "amber",
  RETIRED: "gray",
};

export function LifecycleBadge({ stage }: { stage: LifecycleStage }) {
  return <StatusBadge tone={map[stage]}>{lifecycleLabels[stage]}</StatusBadge>;
}
