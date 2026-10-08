import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LifecycleBadge } from "@/components/ui/LifecycleBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import {
  assessmentLabels,
  businessAreaLabels,
} from "@/lib/labels";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const useCase = await prisma.useCase.findUnique({
    where: { slug },
    include: {
      agents: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          platform: true,
          riskLevel: true,
          certified: true,
          lifecycleStage: true,
        },
      },
      products: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          platform: true,
          riskLevel: true,
          certified: true,
          lifecycleStage: true,
        },
      },
      savedItems: { where: { userKey: "demo-user" }, take: 1 },
    },
  });

  if (!useCase) notFound();

  return (
    <div className="space-y-4">
      <Link href="/use-cases" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Use Cases
      </Link>

      <PageHeader
        title={useCase.name}
        description={useCase.description}
        actions={
          <SaveButton
            assetType="USE_CASE"
            assetId={useCase.id}
            assetSlug={useCase.slug}
            assetName={useCase.name}
            initiallySaved={useCase.savedItems.length > 0}
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="blue">{useCase.useCaseId}</StatusBadge>
        <LifecycleBadge stage={useCase.lifecycle} />
        <RiskBadge level={useCase.riskLevel} />
        <StatusBadge
          tone={
            useCase.riskAssessmentStatus === "ASSESSED"
              ? "green"
              : useCase.riskAssessmentStatus === "PENDING"
                ? "amber"
                : "red"
          }
        >
          {assessmentLabels[useCase.riskAssessmentStatus]}
        </StatusBadge>
        <StatusBadge tone={useCase.gxpRelevant ? "amber" : "gray"}>
          {useCase.gxpRelevant ? "GxP relevant" : "Non-GxP"}
        </StatusBadge>
      </div>

      <PropertyGrid
        items={[
          { label: "Business area", value: businessAreaLabels[useCase.businessArea] },
          { label: "Capability", value: useCase.businessCapability },
          { label: "Owner", value: useCase.owner },
          { label: "Owner email", value: useCase.ownerEmail },
          { label: "Platform", value: useCase.platform || "—" },
          { label: "Lifecycle", value: <LifecycleBadge stage={useCase.lifecycle} /> },
          { label: "Linked agents", value: useCase.agents.length },
          { label: "Linked products", value: useCase.products.length },
          { label: "Updated", value: relativeTime(useCase.updatedAt) },
        ]}
      />

      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">
          Linked agents ({useCase.agents.length})
        </h2>
        {useCase.agents.length === 0 ? (
          <p className="text-sm text-muted">No agents linked to this use case.</p>
        ) : (
          <ul className="divide-y divide-border">
            {useCase.agents.map((agent) => (
              <li key={agent.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {agent.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">{agent.shortDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] text-muted">{agent.platform}</span>
                  <LifecycleBadge stage={agent.lifecycleStage} />
                  <RiskBadge level={agent.riskLevel} />
                  <CertificationBadge certified={agent.certified} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-navy">
          Linked agent products ({useCase.products.length})
        </h2>
        {useCase.products.length === 0 ? (
          <p className="text-sm text-muted">No agent products linked to this use case.</p>
        ) : (
          <ul className="divide-y divide-border">
            {useCase.products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/agent-products/${product.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">
                    {product.shortDescription}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {product.platform ? (
                    <span className="text-[12px] text-muted">{product.platform}</span>
                  ) : null}
                  <LifecycleBadge stage={product.lifecycleStage} />
                  <RiskBadge level={product.riskLevel} />
                  <CertificationBadge certified={product.certified} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
