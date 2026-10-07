import { BadgeCheck } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function CertificationBadge({ certified }: { certified: boolean }) {
  if (!certified) {
    return <StatusBadge tone="gray">Not certified</StatusBadge>;
  }
  return (
    <StatusBadge tone="purple" className="gap-1">
      <BadgeCheck className="h-3 w-3" />
      Certified
    </StatusBadge>
  );
}
