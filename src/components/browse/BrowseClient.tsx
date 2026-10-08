"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronDown, Search } from "lucide-react";
import { AssetCard } from "@/components/cards/AssetCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ViewModeToggle, type ViewMode } from "@/components/ui/ViewModeToggle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { AccessBadge } from "@/components/ui/AccessBadge";
import { UsagePolicyBadge } from "@/components/ui/UsagePolicyBadge";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";
import type { AccessLevel, RiskLevel } from "@prisma/client";
import Link from "next/link";

export type BrowseItem = {
  id: string;
  slug: string;
  name: string;
  type:
    | "AGENT"
    | "AGENT_PRODUCT"
    | "MCP_SERVER"
    | "SKILL"
    | "RULE"
    | "GUIDE"
    | "HOOK"
    | "USE_CASE"
    | "DATA_ASSET"
    | "DATA_PRODUCT"
    | "GLOSSARY_TERM"
    | "DATA_DOMAIN";
  typeLabel: string;
  href: string;
  subtitle: string;
  description: string;
  tags: string;
  rating?: number;
  platform?: string;
  riskLevel?: RiskLevel;
  certified?: boolean;
  businessArea?: string;
  businessCapability?: string;
  lifecycle?: string;
  access?: string;
  accessLevel?: AccessLevel;
  trust?: string;
  updatedAt: string;
  monthlyRuns?: number;
  // business lens
  owner?: string;
  cost?: string;
  usagePolicy?: string;
  valueBenefit?: string;
  // technical lens
  agentId?: string;
  framework?: string;
  model?: string;
  version?: string;
  agentPattern?: string;
  solutionType?: string;
  originType?: string;
  visibility?: string;
};

const typeFilters = [
  "AI Agent",
  "Agent Product",
  "MCP Server",
  "Skill",
  "Rule",
  "Guide",
  "Hook",
  "Use Case",
  "Data Asset",
  "Data Product",
  "Glossary Term",
  "Data Domain",
] as const;
const platformFilters = [
  "UPTIMIZE Foundry",
  "UPTIMIZE Agents",
  "myGPT",
  "HIVE",
  "Microsoft Copilot Studio",
  "Salesforce",
  "SAP Joule",
  "UiPath",
] as const;
const areaFilters = [
  "Healthcare",
  "Life Science",
  "Electronics",
  "Enabling Functions",
  "Global / Cross-Sector",
] as const;
const riskFilters = ["Low", "Medium", "High", "Mission-critical", "Not assessed"] as const;
const lifecycleFilters = ["Idea", "Pilot", "Production", "Retiring", "Retired"] as const;
const trustFilters = ["Certified", "Assessed", "Pending", "Expired"] as const;
const accessFilters = ["Open", "Approval required", "Restricted"] as const;
const solutionTypeFilters = ["Agent Asset", "Agent Product", "Both"] as const;
const patternFilters = ["Standalone", "Orchestrator", "Sub-Agent", "Embedded", "Team Shared"] as const;
const originFilters = ["Internal", "External / Third Party"] as const;
const usageFilters = ["Unlimited use", "Usage limits may apply"] as const;
const useCaseFilters = ["Linked", "Not linked"] as const;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  defaultOpen = false,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-1.5 flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted"
      >
        {title}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="space-y-1.5">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-[13px] text-navy">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onChange(toggle(selected, opt))}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : selected.length > 0 ? (
        <div className="text-[11px] text-primary">{selected.length} selected</div>
      ) : null}
    </div>
  );
}

export function BrowseClient({ items }: { items: BrowseItem[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("business");
  const [types, setTypes] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [lifecycles, setLifecycles] = useState<string[]>([]);
  const [trust, setTrust] = useState<string[]>([]);
  const [access, setAccess] = useState<string[]>([]);
  const [solutionTypes, setSolutionTypes] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [usages, setUsages] = useState<string[]>([]);
  const [useCaseLink, setUseCaseLink] = useState<string[]>([]);
  const capability = searchParams.get("capability") || "";

  const filtered = useMemo(() => {
    let result = [...items];
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.toLowerCase().includes(q) ||
          (i.platform || "").toLowerCase().includes(q) ||
          (i.agentId || "").toLowerCase().includes(q) ||
          (i.businessCapability || "").toLowerCase().includes(q)
      );
    }
    if (capability) {
      result = items.filter((i) => {
        const blob = `${i.name} ${i.description} ${i.subtitle} ${i.tags} ${i.businessCapability || ""}`.toLowerCase();
        return capability
          .toLowerCase()
          .split(/[&/]/)
          .some((part) => part.trim() && blob.includes(part.trim().toLowerCase()));
      });
      if (q) {
        result = result.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.tags.toLowerCase().includes(q)
        );
      }
    }
    if (types.length) result = result.filter((i) => types.includes(i.typeLabel));
    if (platforms.length) {
      result = result.filter((i) =>
        platforms.some((p) => (i.platform || "").toLowerCase().includes(p.toLowerCase()))
      );
    }
    if (areas.length) result = result.filter((i) => areas.includes(i.businessArea || ""));
    if (risks.length) {
      const map: Record<string, string> = {
        Low: "LOW",
        Medium: "MEDIUM",
        High: "HIGH",
        "Mission-critical": "MISSION_CRITICAL",
        "Not assessed": "NOT_ASSESSED",
      };
      result = result.filter((i) => risks.some((r) => i.riskLevel === map[r]));
    }
    if (lifecycles.length) result = result.filter((i) => lifecycles.includes(i.lifecycle || ""));
    if (trust.length) result = result.filter((i) => trust.includes(i.trust || ""));
    if (access.length) result = result.filter((i) => access.includes(i.access || ""));
    if (solutionTypes.length) {
      result = result.filter((i) => solutionTypes.includes(i.solutionType || ""));
    }
    if (patterns.length) result = result.filter((i) => patterns.includes(i.agentPattern || ""));
    if (origins.length) result = result.filter((i) => origins.includes(i.originType || ""));
    if (usages.length) result = result.filter((i) => usages.includes(i.usagePolicy || ""));
    if (useCaseLink.length) {
      result = result.filter((i) => {
        const linked = Boolean(i.tags?.toLowerCase().includes("usecase-linked") || i.type === "USE_CASE" || i.subtitle?.includes("UC-"));
        // Prefer explicit flag via tags convention from page, fallback for agents with use case in subtitle
        if (useCaseLink.includes("Linked") && useCaseLink.includes("Not linked")) return true;
        if (useCaseLink.includes("Linked")) return linked || Boolean(i.businessCapability);
        if (useCaseLink.includes("Not linked")) return !linked;
        return true;
      });
    }

    result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "used") return (b.monthlyRuns || 0) - (a.monthlyRuns || 0);
      if (sort === "updated") return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      const score = (i: BrowseItem) =>
        (i.type === "AGENT" || i.type === "AGENT_PRODUCT" ? 10 : 0) +
        (i.rating || 0) +
        (i.name.toLowerCase().includes(q) ? 5 : 0);
      return score(b) - score(a);
    });
    return result;
  }, [
    items,
    query,
    sort,
    types,
    platforms,
    areas,
    risks,
    lifecycles,
    trust,
    access,
    solutionTypes,
    patterns,
    origins,
    usages,
    useCaseLink,
    capability,
  ]);

  const clearFilters = () => {
    setTypes([]);
    setPlatforms([]);
    setAreas([]);
    setRisks([]);
    setLifecycles([]);
    setTrust([]);
    setAccess([]);
    setSolutionTypes([]);
    setPatterns([]);
    setOrigins([]);
    setUsages([]);
    setUseCaseLink([]);
    setQuery("");
    startTransition(() => router.push("/browse"));
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 rounded-[12px] border border-border bg-white p-4 shadow-sm lg:w-[240px]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Filters</h2>
          <button type="button" className="text-[12px] text-primary hover:underline" onClick={clearFilters}>
            Clear
          </button>
        </div>
        <FilterGroup title="Type" options={typeFilters} selected={types} onChange={setTypes} defaultOpen />
        <FilterGroup title="Business Area" options={areaFilters} selected={areas} onChange={setAreas} defaultOpen />
        <FilterGroup title="Platform" options={platformFilters} selected={platforms} onChange={setPlatforms} />
        <FilterGroup title="Risk" options={riskFilters} selected={risks} onChange={setRisks} defaultOpen />
        <FilterGroup title="Lifecycle" options={lifecycleFilters} selected={lifecycles} onChange={setLifecycles} />
        <FilterGroup title="Trust" options={trustFilters} selected={trust} onChange={setTrust} />
        <FilterGroup title="Access" options={accessFilters} selected={access} onChange={setAccess} />
        <FilterGroup title="Solution Type" options={solutionTypeFilters} selected={solutionTypes} onChange={setSolutionTypes} />
        <FilterGroup title="Agent Pattern" options={patternFilters} selected={patterns} onChange={setPatterns} />
        <FilterGroup title="Origin" options={originFilters} selected={origins} onChange={setOrigins} />
        <FilterGroup title="Usage" options={usageFilters} selected={usages} onChange={setUsages} />
        <FilterGroup title="Use Case" options={useCaseFilters} selected={useCaseLink} onChange={setUseCaseLink} />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Prototype — demo data</div>
            <h1 className="text-[24px] font-semibold text-navy">
              {filtered.length} results{pending ? "…" : ""}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {viewMode === "business"
                ? "Business view — purpose, ownership, risk, access and cost"
                : "Technical view — platform, runtime, model, version and dependencies"}
            </p>
            {capability ? <p className="text-sm text-muted">Capability: {capability}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="used">Most used</option>
              <option value="rating">Highest rated</option>
              <option value="updated">Recently updated</option>
              <option value="name">Name</option>
            </select>
            <button
              type="button"
              onClick={() => toast("Available in production version")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-bg"
            >
              <Bell className="h-4 w-4" />
              Create alert
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search within results..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No assets match the current filters."
            description="Try clearing filters or searching for a different capability."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) =>
              viewMode === "business" ? (
                <BusinessResultCard key={`${item.type}-${item.id}`} item={item} />
              ) : (
                <TechnicalResultCard key={`${item.type}-${item.id}`} item={item} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BusinessResultCard({ item }: { item: BrowseItem }) {
  return (
    <div className="group relative rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <Link href={item.href} className="absolute inset-0 z-0 rounded-[12px]" aria-label={item.name} />
      <div className="relative z-10 pointer-events-none">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-[16px] font-semibold text-navy group-hover:text-primary">{item.name}</h3>
          <StatusBadge tone="blue">{item.typeLabel}</StatusBadge>
        </div>
        <p className="mb-2 line-clamp-2 text-[13px] text-[#4A5568]">{item.description}</p>
        <div className="mb-3 flex flex-wrap gap-1.5 text-[12px]">
          {item.businessCapability ? (
            <span className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-muted">{item.businessCapability}</span>
          ) : null}
          {item.businessArea ? (
            <span className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-muted">{item.businessArea}</span>
          ) : null}
          {item.lifecycle ? <StatusBadge tone="purple">{item.lifecycle}</StatusBadge> : null}
          {item.riskLevel ? <RiskBadge level={item.riskLevel} /> : null}
          {typeof item.certified === "boolean" ? <CertificationBadge certified={item.certified} /> : null}
          {item.accessLevel ? <AccessBadge level={item.accessLevel} /> : item.access ? <StatusBadge tone="amber">{item.access}</StatusBadge> : null}
          <UsagePolicyBadge policy={item.usagePolicy} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[12px] text-muted">
          {item.owner ? <span>Owner {item.owner}</span> : null}
          {item.cost ? <span>{item.cost}</span> : null}
          {item.valueBenefit ? <span className="line-clamp-1 max-w-md">{item.valueBenefit}</span> : null}
          {item.platform ? <span className="font-medium text-navy">{item.platform}</span> : null}
        </div>
      </div>
    </div>
  );
}

function TechnicalResultCard({ item }: { item: BrowseItem }) {
  return (
    <AssetCard
      href={item.href}
      name={item.name}
      typeLabel={item.typeLabel}
      subtitle={
        [item.agentId, item.framework || item.platform, item.version ? `v${item.version}` : null]
          .filter(Boolean)
          .join(" · ") || item.subtitle
      }
      description={item.description}
      tags={[item.agentPattern, item.model, item.solutionType, item.originType].filter(Boolean).join(",")}
      rating={item.rating}
      platform={item.platform}
      riskLevel={item.riskLevel}
      certified={item.certified}
    />
  );
}
