"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { AssetCard } from "@/components/cards/AssetCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/providers/ToastProvider";
import type { RiskLevel } from "@prisma/client";

export type BrowseItem = {
  id: string;
  slug: string;
  name: string;
  type: "AGENT" | "MCP_SERVER" | "SKILL" | "RULE" | "GUIDE" | "HOOK";
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
  lifecycle?: string;
  access?: string;
  trust?: string;
  updatedAt: string;
  monthlyRuns?: number;
};

const typeFilters = ["AI Agent", "MCP Server", "Skill", "Rule", "Guide", "Hook"] as const;
const platformFilters = [
  "UPTIMIZE",
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
const riskFilters = ["Low", "Medium", "High", "Not assessed"] as const;
const lifecycleFilters = ["Idea", "Pilot", "Production", "Retiring", "Retired"] as const;
const trustFilters = ["Certified", "Assessed", "Verification pending"] as const;
const accessFilters = ["Open", "Approval required", "Restricted"] as const;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="border-b border-border py-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</div>
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
  const [types, setTypes] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [lifecycles, setLifecycles] = useState<string[]>([]);
  const [trust, setTrust] = useState<string[]>([]);
  const [access, setAccess] = useState<string[]>([]);
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
          (i.platform || "").toLowerCase().includes(q)
      );
    }
    if (capability) {
      result = result.filter((i) => i.tags.toLowerCase().includes(capability.toLowerCase().split(" ")[0]) || i.subtitle.toLowerCase().includes(capability.toLowerCase()) || i.description.toLowerCase().includes(capability.toLowerCase().split("&")[0].trim().toLowerCase()));
      // also match capabilityCategory via tags/subtitle heuristics for demo
      result = items.filter((i) => {
        const blob = `${i.name} ${i.description} ${i.subtitle} ${i.tags}`.toLowerCase();
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
        "Not assessed": "NOT_ASSESSED",
      };
      result = result.filter((i) => risks.some((r) => i.riskLevel === map[r]));
    }
    if (lifecycles.length) result = result.filter((i) => lifecycles.includes(i.lifecycle || ""));
    if (trust.length) result = result.filter((i) => trust.includes(i.trust || ""));
    if (access.length) result = result.filter((i) => access.includes(i.access || ""));

    result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "used") return (b.monthlyRuns || 0) - (a.monthlyRuns || 0);
      if (sort === "updated") return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      // relevance: prefer agents, then rating
      const score = (i: BrowseItem) =>
        (i.type === "AGENT" ? 10 : 0) + (i.rating || 0) + (i.name.toLowerCase().includes(q) ? 5 : 0);
      return score(b) - score(a);
    });
    return result;
  }, [items, query, sort, types, platforms, areas, risks, lifecycles, trust, access, capability]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 rounded-[12px] border border-border bg-white p-4 shadow-sm lg:w-[240px]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Filters</h2>
          <button
            type="button"
            className="text-[12px] text-primary hover:underline"
            onClick={() => {
              setTypes([]);
              setPlatforms([]);
              setAreas([]);
              setRisks([]);
              setLifecycles([]);
              setTrust([]);
              setAccess([]);
              setQuery("");
              startTransition(() => router.push("/browse"));
            }}
          >
            Clear
          </button>
        </div>
        <FilterGroup title="Type" options={typeFilters} selected={types} onChange={setTypes} />
        <FilterGroup title="Platform" options={platformFilters} selected={platforms} onChange={setPlatforms} />
        <FilterGroup title="Business Area" options={areaFilters} selected={areas} onChange={setAreas} />
        <FilterGroup title="Risk" options={riskFilters} selected={risks} onChange={setRisks} />
        <FilterGroup title="Lifecycle" options={lifecycleFilters} selected={lifecycles} onChange={setLifecycles} />
        <FilterGroup title="Trust" options={trustFilters} selected={trust} onChange={setTrust} />
        <FilterGroup title="Access" options={accessFilters} selected={access} onChange={setAccess} />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Prototype — demo data</div>
            <h1 className="text-[24px] font-semibold text-navy">
              {filtered.length} results{pending ? "…" : ""}
            </h1>
            {capability ? <p className="text-sm text-muted">Capability: {capability}</p> : null}
          </div>
          <div className="flex items-center gap-2">
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
          <EmptyState icon={Search} title="No assets match the current filters." description="Try clearing filters or searching for a different capability." />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <AssetCard
                key={`${item.type}-${item.id}`}
                href={item.href}
                name={item.name}
                typeLabel={item.typeLabel}
                subtitle={item.subtitle}
                description={item.description}
                tags={item.tags}
                rating={item.rating}
                platform={item.platform}
                riskLevel={item.riskLevel}
                certified={item.certified}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
