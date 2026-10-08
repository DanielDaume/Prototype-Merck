"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Boxes, Network, Star } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LifecycleBadge } from "@/components/ui/LifecycleBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { AccessBadge } from "@/components/ui/AccessBadge";
import { UsagePolicyBadge } from "@/components/ui/UsagePolicyBadge";
import { PropertyGrid } from "@/components/ui/PropertyGrid";
import { SaveButton } from "@/components/actions/SaveButton";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { businessAreaLabels } from "@/lib/labels";
import { parseTags, relativeTime } from "@/lib/utils";
import type {
  AccessLevel,
  AssetType,
  BusinessArea,
  LifecycleStage,
  RiskLevel,
} from "@prisma/client";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "governance", label: "Governance" },
  { id: "dependencies", label: "Dependencies" },
  { id: "activity", label: "Activity" },
];

const roleOrder = ["Orchestrator", "Primary Agent", "Sub-Agent", "Supporting Agent"];

function roleTone(role: string): "purple" | "blue" | "teal" | "gray" {
  if (role === "Orchestrator") return "purple";
  if (role === "Primary Agent") return "blue";
  if (role === "Sub-Agent") return "teal";
  return "gray";
}

function roleAccent(role: string): string {
  if (role === "Orchestrator") return "border-l-[#7C3AED] bg-[#F5F3FF]";
  if (role === "Primary Agent") return "border-l-primary bg-primary-light/40";
  if (role === "Sub-Agent") return "border-l-[#0D9488] bg-[#F0FDFA]";
  return "border-l-[#94A3B8] bg-[#F8FAFC]";
}

type ComponentAgent = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  platform: string;
  riskLevel: RiskLevel;
  certified: boolean;
  lifecycleStage: LifecycleStage;
  role: string;
  sortOrder: number;
};

type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  businessArea: BusinessArea;
  businessCapability: string;
  businessOwner: string;
  businessOwnerEmail: string;
  lifecycleStage: LifecycleStage;
  riskLevel: RiskLevel;
  accessLevel: AccessLevel;
  certified: boolean;
  rating: number;
  ratingCount: number;
  valueBenefit: string;
  usagePolicy: string;
  platform: string | null;
  tags: string;
  updatedAt: string;
  createdAt: string;
  saved: boolean;
  linkedUseCase: {
    id: string;
    slug: string;
    useCaseId: string;
    name: string;
  } | null;
  agents: ComponentAgent[];
  activities: {
    id: string;
    title: string;
    description: string;
    actor: string;
    createdAt: string;
    assetType: AssetType | null;
    assetName: string | null;
    assetSlug: string | null;
  }[];
};

export function AgentProductDetailClient({ product }: { product: ProductDetail }) {
  const [active, setActive] = useState("overview");
  const tags = parseTags(product.tags);

  const sortedAgents = [...product.agents].sort((a, b) => {
    const ai = roleOrder.indexOf(a.role);
    const bi = roleOrder.indexOf(b.role);
    const ar = ai === -1 ? 99 : ai;
    const br = bi === -1 ? 99 : bi;
    if (ar !== br) return ar - br;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="space-y-4">
      <Link
        href="/agent-products"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agent Products
      </Link>

      <div className="rounded-[14px] border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge tone="blue">Agent Product</StatusBadge>
              {product.platform ? (
                <span className="text-[12px] font-medium text-navy">{product.platform}</span>
              ) : null}
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-navy">{product.name}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted">{product.shortDescription}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LifecycleBadge stage={product.lifecycleStage} />
              <RiskBadge level={product.riskLevel} />
              <AccessBadge level={product.accessLevel} />
              <CertificationBadge certified={product.certified} />
              <UsagePolicyBadge policy={product.usagePolicy} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {product.rating > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.rating.toFixed(1)}
                <span className="text-muted">({product.ratingCount})</span>
              </span>
            ) : null}
            <SaveButton
              assetType="AGENT_PRODUCT"
              assetId={product.id}
              assetSlug={product.slug}
              assetName={product.name}
              initiallySaved={product.saved}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0 rounded-[12px] border border-border bg-white shadow-sm">
          <div className="px-4 pt-2">
            <Tabs tabs={tabs} active={active} onChange={setActive} />
          </div>

          <div className="p-4">
            {active === "overview" ? (
              <div className="space-y-5">
                <section>
                  <h2 className="mb-2 text-sm font-semibold text-navy">Description</h2>
                  <p className="text-[13px] leading-relaxed text-[#4A5568]">{product.description}</p>
                </section>

                <PropertyGrid
                  items={[
                    { label: "Business area", value: businessAreaLabels[product.businessArea] },
                    { label: "Capability", value: product.businessCapability },
                    { label: "Value / benefit", value: product.valueBenefit },
                    { label: "Owner", value: product.businessOwner },
                    { label: "Owner email", value: product.businessOwnerEmail },
                    { label: "Components", value: product.agents.length },
                    {
                      label: "Related use case",
                      value: product.linkedUseCase ? (
                        <Link
                          href={`/use-cases/${product.linkedUseCase.slug}`}
                          className="text-primary hover:underline"
                        >
                          {product.linkedUseCase.useCaseId} · {product.linkedUseCase.name}
                        </Link>
                      ) : (
                        "—"
                      ),
                    },
                    { label: "Updated", value: relativeTime(product.updatedAt) },
                  ]}
                />

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <section>
                  <h2 className="mb-2 text-sm font-semibold text-navy">Composition snapshot</h2>
                  <p className="mb-3 text-[12px] text-muted">
                    Agent products package reusable assets with explicit composition roles.
                  </p>
                  <div className="space-y-2">
                    {sortedAgents.slice(0, 4).map((agent) => (
                      <CompositionRow key={agent.id} agent={agent} compact />
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {active === "components" ? (
              <div className="space-y-3">
                <div className="mb-1 flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-navy">
                    Component agents ({sortedAgents.length})
                  </h2>
                </div>
                <p className="text-[12px] text-muted">
                  Roles show how each agent contributes to the product composition.
                </p>
                <div className="space-y-3">
                  {sortedAgents.map((agent) => (
                    <CompositionRow key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            ) : null}

            {active === "governance" ? (
              <div className="space-y-4">
                <PropertyGrid
                  items={[
                    { label: "Lifecycle", value: <LifecycleBadge stage={product.lifecycleStage} /> },
                    { label: "Risk", value: <RiskBadge level={product.riskLevel} /> },
                    { label: "Access", value: <AccessBadge level={product.accessLevel} /> },
                    {
                      label: "Certification",
                      value: <CertificationBadge certified={product.certified} />,
                    },
                    {
                      label: "Usage policy",
                      value: <UsagePolicyBadge policy={product.usagePolicy} />,
                    },
                    { label: "Business owner", value: product.businessOwner },
                    { label: "Contact", value: product.businessOwnerEmail },
                    { label: "Platform", value: product.platform || "—" },
                  ]}
                />
                <div className="rounded-lg border border-border bg-[#FAFBFC] p-3 text-[13px] text-[#4A5568]">
                  Product-level governance inherits component assessments. Review linked agents for
                  detailed risk, data classification and oversight controls.
                </div>
              </div>
            ) : null}

            {active === "dependencies" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-navy">Composition dependencies</h2>
                </div>
                <p className="text-[13px] text-muted">
                  This product depends on the following agent assets. Opening a component shows its
                  own MCP, skill and rule dependencies.
                </p>
                <div className="overflow-hidden rounded-[10px] border border-border">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#243443] text-white">
                      <tr>
                        <th className="px-3 py-2 font-medium">Role</th>
                        <th className="px-3 py-2 font-medium">Agent</th>
                        <th className="px-3 py-2 font-medium">Platform</th>
                        <th className="px-3 py-2 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {sortedAgents.map((agent) => (
                        <tr key={agent.id}>
                          <td className="px-3 py-2.5">
                            <StatusBadge tone={roleTone(agent.role)}>{agent.role}</StatusBadge>
                          </td>
                          <td className="px-3 py-2.5">
                            <Link
                              href={`/agents/${agent.slug}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {agent.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-muted">{agent.platform}</td>
                          <td className="px-3 py-2.5">
                            <RiskBadge level={agent.riskLevel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {product.linkedUseCase ? (
                  <div className="rounded-lg border border-border bg-[#FAFBFC] px-3 py-2.5 text-[13px]">
                    <span className="text-muted">Business use case · </span>
                    <Link
                      href={`/use-cases/${product.linkedUseCase.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {product.linkedUseCase.useCaseId} — {product.linkedUseCase.name}
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            {active === "activity" ? (
              product.activities.length > 0 ? (
                <ActivityTimeline items={product.activities} />
              ) : (
                <p className="text-sm text-muted">No recent activity for this product.</p>
              )
            ) : null}
          </div>
        </div>

        <aside className="space-y-3">
          <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-navy">Governance</h2>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <LifecycleBadge stage={product.lifecycleStage} />
                <RiskBadge level={product.riskLevel} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <AccessBadge level={product.accessLevel} />
                <CertificationBadge certified={product.certified} />
              </div>
              <UsagePolicyBadge policy={product.usagePolicy} />
            </div>
            <div className="mt-3 border-t border-border pt-3 text-[12px] text-muted">
              <div className="font-medium text-navy">{product.businessOwner}</div>
              <div>{product.businessOwnerEmail}</div>
            </div>
          </section>

          {product.linkedUseCase ? (
            <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-navy">Related use case</h2>
              <Link
                href={`/use-cases/${product.linkedUseCase.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {product.linkedUseCase.useCaseId}
              </Link>
              <p className="mt-1 text-[12px] text-muted">{product.linkedUseCase.name}</p>
            </section>
          ) : null}

          <section className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-navy">Components</h2>
            <ul className="space-y-2">
              {sortedAgents.map((agent) => (
                <li key={agent.id} className="text-[12px]">
                  <StatusBadge tone={roleTone(agent.role)}>{agent.role}</StatusBadge>
                  <div className="mt-1">
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {agent.name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CompositionRow({
  agent,
  compact = false,
}: {
  agent: ComponentAgent;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={`block rounded-[10px] border border-border border-l-4 p-3 transition hover:border-primary/30 hover:shadow-sm ${roleAccent(agent.role)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <StatusBadge tone={roleTone(agent.role)}>{agent.role}</StatusBadge>
            <span className="text-[12px] text-muted">{agent.platform}</span>
          </div>
          <div className="text-sm font-semibold text-navy">{agent.name}</div>
          {!compact ? (
            <p className="mt-1 line-clamp-2 text-[12px] text-[#4A5568]">{agent.shortDescription}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <LifecycleBadge stage={agent.lifecycleStage} />
          <RiskBadge level={agent.riskLevel} />
          {!compact ? <CertificationBadge certified={agent.certified} /> : null}
        </div>
      </div>
    </Link>
  );
}
