"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AssessmentStatus, LifecycleStage, RiskLevel } from "@prisma/client";
import { assessmentLabels } from "@/lib/labels";

export type UseCaseListItem = {
  id: string;
  slug: string;
  useCaseId: string;
  name: string;
  description: string;
  businessArea: string;
  businessCapability: string;
  riskLevel: RiskLevel;
  riskAssessmentStatus: AssessmentStatus;
  gxpRelevant: boolean;
  lifecycle: LifecycleStage;
  agentCount: number;
  productCount: number;
  owner: string;
  platform?: string | null;
};

export function UseCasesClient({ useCases }: { useCases: UseCaseListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return useCases;
    return useCases.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.useCaseId.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q) ||
        u.businessArea.toLowerCase().includes(q) ||
        u.businessCapability.toLowerCase().includes(q)
    );
  }, [useCases, query]);

  return (
    <div>
      <PageHeader
        title="Use Cases"
        description="Explore the governed business use cases connected to AI capabilities."
      />

      <div className="mb-4 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by use case ID, name or area..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border bg-white shadow-sm">
        <div className="hidden grid-cols-[120px_1.4fr_1fr_auto_auto_auto_auto] gap-3 border-b border-border bg-[#FAFBFC] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted lg:grid">
          <span>Use Case ID</span>
          <span>Name</span>
          <span>Area</span>
          <span>Risk</span>
          <span>Assessment</span>
          <span>GxP</span>
          <span>Linked</span>
        </div>
        <ul className="divide-y divide-border">
          {filtered.map((uc) => (
            <li key={uc.id}>
              <Link
                href={`/use-cases/${uc.slug}`}
                className="grid gap-2 px-4 py-3 transition hover:bg-bg/60 lg:grid-cols-[120px_1.4fr_1fr_auto_auto_auto_auto] lg:items-center lg:gap-3"
              >
                <code className="text-[12px] font-semibold text-primary">{uc.useCaseId}</code>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-navy">{uc.name}</div>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">{uc.description}</p>
                </div>
                <div className="text-[12px] text-muted">
                  <div className="font-medium text-navy">{uc.businessArea}</div>
                  <div>{uc.businessCapability}</div>
                </div>
                <RiskBadge level={uc.riskLevel} />
                <StatusBadge
                  tone={
                    uc.riskAssessmentStatus === "ASSESSED"
                      ? "green"
                      : uc.riskAssessmentStatus === "PENDING"
                        ? "amber"
                        : "red"
                  }
                >
                  {assessmentLabels[uc.riskAssessmentStatus]}
                </StatusBadge>
                <StatusBadge tone={uc.gxpRelevant ? "amber" : "gray"}>
                  {uc.gxpRelevant ? "GxP" : "Non-GxP"}
                </StatusBadge>
                <div className="text-[12px] text-muted">
                  <div>{uc.agentCount} agents</div>
                  <div>{uc.productCount} products</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
