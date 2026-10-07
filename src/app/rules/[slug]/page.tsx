import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SaveButton } from "@/components/actions/SaveButton";
import { severityLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function RuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rule = await prisma.rule.findUnique({
    where: { slug },
    include: {
      agents: { include: { agent: true } },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });
  if (!rule) notFound();

  return (
    <div className="space-y-4">
      <Link href="/rules" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to rules
      </Link>
      <PageHeader
        title={rule.name}
        description={rule.description}
        actions={
          <SaveButton
            assetType="RULE"
            assetId={rule.id}
            assetSlug={rule.slug}
            assetName={rule.name}
            initiallySaved={rule.savedItems.length > 0}
          />
        }
      />
      <StatusBadge tone="red">{severityLabels[rule.severity]}</StatusBadge>
      <PropertyGrid
        items={[
          { label: "Scope", value: rule.scope },
          { label: "Status", value: rule.status },
          { label: "Owner", value: rule.owner },
          { label: "Policy category", value: rule.policyCategory },
          { label: "Agents", value: rule.agents.length },
        ]}
      />
      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">Applied to agents</h2>
        <ul className="space-y-2">
          {rule.agents.map(({ agent }) => (
            <li key={agent.id}>
              <Link href={`/agents/${agent.slug}`} className="text-sm font-medium text-primary hover:underline">
                {agent.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
