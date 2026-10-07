import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { severityLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const rules = await prisma.rule.findMany({
    include: { agents: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Rules & Guardrails"
        description="Policies and runtime constraints applied to enterprise AI agents."
      />
      <div className="space-y-3">
        {rules.map((rule) => (
          <Link
            key={rule.id}
            href={`/rules/${rule.slug}`}
            className="block rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-semibold text-navy">{rule.name}</h3>
              <StatusBadge
                tone={
                  rule.severity === "CRITICAL" || rule.severity === "HIGH"
                    ? "red"
                    : rule.severity === "MEDIUM"
                      ? "amber"
                      : "green"
                }
              >
                {severityLabels[rule.severity]}
              </StatusBadge>
              <StatusBadge tone="gray">{rule.policyCategory}</StatusBadge>
            </div>
            <p className="mb-2 text-[13px] text-[#4A5568]">{rule.shortDescription}</p>
            <div className="text-[12px] text-muted">
              Scope: {rule.scope} · {rule.agents.length} agents · {rule.owner}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
