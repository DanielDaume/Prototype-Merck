import { StatusBadge } from "./StatusBadge";
import { repositoryStatusLabels } from "@/lib/labels";
import type { RepositoryStatus } from "@prisma/client";

export function CoverageBadge({ status }: { status: RepositoryStatus }) {
  const tone =
    status === "IN_SCOPE"
      ? "green"
      : status === "CONTEXT_FEED"
        ? "blue"
        : status === "TARGET_STATE"
          ? "purple"
          : "amber";
  return <StatusBadge tone={tone}>{repositoryStatusLabels[status]}</StatusBadge>;
}
