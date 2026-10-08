import { StatusBadge } from "./StatusBadge";

export function UsagePolicyBadge({ policy }: { policy?: string | null }) {
  if (!policy) return null;
  const limited = policy.toLowerCase().includes("limit");
  return (
    <StatusBadge tone={limited ? "amber" : "green"}>{policy}</StatusBadge>
  );
}
