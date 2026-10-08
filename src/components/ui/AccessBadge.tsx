import { StatusBadge } from "./StatusBadge";
import { accessLabels } from "@/lib/labels";
import type { AccessLevel } from "@prisma/client";

export function AccessBadge({ level }: { level: AccessLevel }) {
  const tone = level === "OPEN" ? "green" : level === "RESTRICTED" ? "red" : "amber";
  return <StatusBadge tone={tone}>{accessLabels[level]}</StatusBadge>;
}
