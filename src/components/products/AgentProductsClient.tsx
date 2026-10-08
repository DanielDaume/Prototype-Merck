"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Boxes } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LifecycleBadge } from "@/components/ui/LifecycleBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { AccessBadge } from "@/components/ui/AccessBadge";
import { UsagePolicyBadge } from "@/components/ui/UsagePolicyBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AccessLevel, LifecycleStage, RiskLevel } from "@prisma/client";

export type AgentProductListItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  businessArea: string;
  businessCapability: string;
  lifecycleStage: LifecycleStage;
  riskLevel: RiskLevel;
  accessLevel: AccessLevel;
  certified: boolean;
  usagePolicy: string;
  businessOwner: string;
  componentCount: number;
  platform?: string | null;
};

export function AgentProductsClient({ products }: { products: AgentProductListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.businessCapability.toLowerCase().includes(q) ||
        p.businessArea.toLowerCase().includes(q) ||
        (p.platform || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div>
      <PageHeader
        title="Agent Products"
        description="Business-facing AI capabilities composed from reusable agent assets."
      />

      <div className="mb-4 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter agent products..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/agent-products/${product.slug}`}
            className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge tone="blue">Agent Product</StatusBadge>
                  {product.platform ? (
                    <span className="text-[12px] font-medium text-navy">{product.platform}</span>
                  ) : null}
                </div>
                <h3 className="text-[17px] font-semibold text-navy">{product.name}</h3>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Boxes className="h-4 w-4" />
              </div>
            </div>

            <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{product.shortDescription}</p>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
                {product.businessArea}
              </span>
              <span className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
                {product.businessCapability}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <LifecycleBadge stage={product.lifecycleStage} />
              <RiskBadge level={product.riskLevel} />
              <AccessBadge level={product.accessLevel} />
              <CertificationBadge certified={product.certified} />
              <UsagePolicyBadge policy={product.usagePolicy} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[12px] text-muted">
              <span>Owner {product.businessOwner}</span>
              <span className="font-medium text-navy">
                {product.componentCount} component{product.componentCount === 1 ? "" : "s"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
